import crypto from 'node:crypto';
import { createHmacSignature } from './security.mjs';

/**
 * Enqueues an admin email notification without blocking or failing the primary DB transaction.
 */
export function enqueueAdminEmail(db, { subject, bodyText, bodyHtml = '' }) {
  const recipient = process.env.ADMIN_ALERT_EMAIL || '';
  if (!recipient) {
    // Store in queue as pending_config so no alert is lost before SMTP/API env is set
    db.prepare(`
      INSERT INTO email_queue (recipient, subject, body_text, body_html, status, last_error)
      VALUES (?, ?, ?, ?, 'pending', 'ADMIN_ALERT_EMAIL not configured')
    `).run('unconfigured', subject, bodyText, bodyHtml);
    return { queued: true, configured: false };
  }

  db.prepare(`
    INSERT INTO email_queue (recipient, subject, body_text, body_html, status)
    VALUES (?, ?, ?, ?, 'pending')
  `).run(recipient, subject, bodyText, bodyHtml);

  // Fire-and-forget async delivery attempt
  setImmediate(() => processEmailQueue(db).catch(() => {}));
  return { queued: true, configured: true };
}

export async function processEmailQueue(db) {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'noreply@aitopindex.com';
  const adminEmail = process.env.ADMIN_ALERT_EMAIL;

  if (!resendKey || !adminEmail) return;

  const pending = db.prepare(`
    SELECT * FROM email_queue
    WHERE status = 'pending' AND attempts < 5
    ORDER BY id ASC LIMIT 10
  `).all();

  for (const row of pending) {
    const targetRecipient = row.recipient === 'unconfigured' ? adminEmail : row.recipient;
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [targetRecipient],
          subject: row.subject,
          text: row.body_text,
          html: row.body_html || undefined,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errText}`);
      }

      db.prepare(`
        UPDATE email_queue SET status = 'sent', sent_at = datetime('now'), attempts = attempts + 1
        WHERE id = ?
      `).run(row.id);
    } catch (err) {
      db.prepare(`
        UPDATE email_queue SET attempts = attempts + 1, last_error = ?,
        status = CASE WHEN attempts + 1 >= 5 THEN 'failed' ELSE 'pending' END
        WHERE id = ?
      `).run(String(err.message || err), row.id);
    }
  }
}

/**
 * Enqueues a signed Hermes Agent event (listing.submitted | lead.created).
 * Never exposes auto-approve links or allows autonomous DB mutations by Hermes.
 */
export function enqueueHermesEvent(db, eventType, payload) {
  const eventId = `evt_${crypto.randomUUID()}`;
  const envelope = {
    event_id: eventId,
    event_type: eventType,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  db.prepare(`
    INSERT INTO hermes_events (event_id, event_type, payload_json, status)
    VALUES (?, ?, ?, 'pending')
  `).run(eventId, eventType, JSON.stringify(envelope));

  setImmediate(() => dispatchHermesEvents(db).catch(() => {}));
  return eventId;
}

export async function dispatchHermesEvents(db) {
  const webhookUrl = process.env.HERMES_WEBHOOK_URL;
  const webhookSecret = process.env.HERMES_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) return;

  const pending = db.prepare(`
    SELECT * FROM hermes_events
    WHERE status = 'pending' AND attempts < 5
    ORDER BY id ASC LIMIT 10
  `).all();

  for (const row of pending) {
    try {
      const signature = createHmacSignature(row.payload_json, webhookSecret);
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AITopIndex-Event': row.event_type,
          'X-AITopIndex-Event-Id': row.event_id,
          'X-AITopIndex-Signature': `sha256=${signature}`,
        },
        body: row.payload_json,
        signal: AbortSignal.timeout(5000),
      });

      if (!resp.ok) {
        throw new Error(`Hermes HTTP ${resp.status}`);
      }

      db.prepare(`
        UPDATE hermes_events SET status = 'delivered', delivered_at = datetime('now'), attempts = attempts + 1
        WHERE id = ?
      `).run(row.id);
    } catch (err) {
      db.prepare(`
        UPDATE hermes_events SET attempts = attempts + 1, last_error = ?,
        status = CASE WHEN attempts + 1 >= 5 THEN 'failed' ELSE 'pending' END
        WHERE id = ?
      `).run(String(err.message || err), row.id);
    }
  }
}
