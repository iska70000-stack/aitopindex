import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHmacSignature } from './security.mjs';

const execFileAsync = promisify(execFile);

/**
 * Formats a concise, PII-safe Telegram message for Hermes Agent.
 */
export function formatHermesMessage(eventType, envelope) {
  const d = envelope.data || {};
  if (eventType === 'listing.submitted') {
    return [
      'New AITopIndex Listing',
      '',
      `Company: ${d.organization_name || ''}`,
      `Website: ${d.normalized_domain || ''}`,
      `Category: ${d.category_id || ''}`,
      `Status: Pending Review`,
      `Duplicate Check: ${d.duplicate_check || 'Checked'}`,
      '',
      `Application ID: ${d.submission_id || ''}`,
      `Review in Admin Panel: ${d.admin_url || ''}`,
    ].join('\n');
  }

  if (eventType === 'lead.created') {
    return [
      'New AITopIndex Client Lead',
      '',
      `Client Company: ${d.company_name || ''}`,
      `Country: ${d.country || '—'} | Industry: ${d.industry || '—'}`,
      `Solution Needed: ${d.required_solution || ''}`,
      `Budget: ${d.estimated_budget || 'Not specified'}`,
      `Status: New Lead`,
      '',
      `Lead ID: ${d.lead_id || ''}`,
      `Review in Admin Panel: ${d.admin_url || ''}`,
    ].join('\n');
  }

  return `AITopIndex Event: ${eventType} (${envelope.event_id})`;
}

/**
 * Enqueues an admin email notification without blocking or failing the primary DB transaction.
 */
export function enqueueAdminEmail(db, { subject, bodyText, bodyHtml = '' }) {
  const recipient = process.env.ADMIN_ALERT_EMAIL || '';
  if (!recipient) {
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
  const cliPython = process.env.HERMES_CLI_PYTHON; // e.g. /root/.hermes/hermes-agent/venv/bin/python
  const cliScript = process.env.HERMES_CLI_SCRIPT || '/root/.hermes/hermes-agent/hermes_cli/main.py';
  const cliTarget = process.env.HERMES_CLI_TARGET; // e.g. telegram:Исмаил (dm)

  const webhookUrl = process.env.HERMES_WEBHOOK_URL;
  const webhookSecret = process.env.HERMES_WEBHOOK_SECRET;

  if ((!cliPython || !cliTarget) && (!webhookUrl || !webhookSecret)) {
    return { dispatched: 0, skipped: 'Hermes transport not configured' };
  }

  // Only process pending events with < 5 attempts (prevents duplicates since delivered rows are excluded)
  const pending = db.prepare(`
    SELECT * FROM hermes_events
    WHERE status = 'pending' AND attempts < 5
    ORDER BY id ASC LIMIT 10
  `).all();

  let dispatched = 0;

  for (const row of pending) {
    try {
      const envelope = JSON.parse(row.payload_json);

      if (cliPython && cliTarget) {
        // Safe local delivery via Hermes CLI `hermes send --to` (zero public port exposure)
        const messageText = formatHermesMessage(row.event_type, envelope);
        await execFileAsync(cliPython, [cliScript, 'send', '--to', cliTarget, messageText], {
          timeout: 15000,
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        });
      } else if (webhookUrl && webhookSecret) {
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
      }

      db.prepare(`
        UPDATE hermes_events SET status = 'delivered', delivered_at = datetime('now'), attempts = attempts + 1, last_error = ''
        WHERE id = ? AND status = 'pending'
      `).run(row.id);
      dispatched++;
    } catch (err) {
      db.prepare(`
        UPDATE hermes_events SET attempts = attempts + 1, last_error = ?,
        status = CASE WHEN attempts + 1 >= 5 THEN 'failed' ELSE 'pending' END
        WHERE id = ?
      `).run(String(err.message || err).slice(0, 500), row.id);
    }
  }

  return { dispatched };
}
