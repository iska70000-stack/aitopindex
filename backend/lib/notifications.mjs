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
      ...(d.tech_stack ? [`Tools: ${d.tech_stack}`] : []),
      ...(d.case_study_url ? [`Example of work: ${d.case_study_url}`] : []),
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

  if (eventType === 'contact.created') {
    return [
      'New AITopIndex Contact Message',
      '',
      `Subject: ${d.subject || ''}`,
      `From: ${d.sender_email || ''}`,
      `Language: ${(d.lang || 'en').toUpperCase()}`,
      `Message: ${String(d.message || '').slice(0, 500)}`,
      '',
      `Message ID: ${d.message_id || ''}`,
    ].join('\n');
  }

  return `AITopIndex Event: ${eventType} (${envelope.event_id})`;
}

/**
 * Enqueues an admin email notification without blocking or failing the primary DB transaction.
 */
export function enqueueAdminEmail(db, { recipient = '', replyTo = '', subject, bodyText, bodyHtml = '' }) {
  const target = recipient || process.env.ADMIN_ALERT_EMAIL || '';
  if (!target) {
    db.prepare(`
      INSERT INTO email_queue (recipient, reply_to, subject, body_text, body_html, status, last_error)
      VALUES (?, ?, ?, ?, ?, 'pending', 'ADMIN_ALERT_EMAIL not configured')
    `).run('unconfigured', replyTo, subject, bodyText, bodyHtml);
    return { queued: true, configured: false };
  }

  db.prepare(`
    INSERT INTO email_queue (recipient, reply_to, subject, body_text, body_html, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(target, replyTo, subject, bodyText, bodyHtml);

  setImmediate(() => processEmailQueue(db).catch(() => {}));
  return { queued: true, configured: true };
}

export async function processEmailQueue(db) {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'noreply@aitopindex.com';
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'hello@aitopindex.com';

  if (!resendKey) return;

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
          reply_to: row.reply_to || undefined,
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

export function buildHermesReplyMarkup(eventType, envelope) {
  const d = envelope.data || {};
  if (eventType === 'listing.submitted' && d.submission_id) {
    return {
      inline_keyboard: [
        [
          { text: '✅ Одобрить', callback_data: `ati:sub_approve:${d.submission_id}` },
          { text: '❌ Отклонить', callback_data: `ati:sub_reject:${d.submission_id}` },
        ],
      ],
    };
  }

  if (eventType === 'lead.created' && d.lead_id) {
    return {
      inline_keyboard: [
        [
          { text: '✅ В работу', callback_data: `ati:lead_work:${d.lead_id}` },
          { text: '🗑 Спам', callback_data: `ati:lead_spam:${d.lead_id}` },
        ],
      ],
    };
  }

  return undefined;
}

export async function dispatchHermesEvents(db) {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_HOME_CHANNEL;

  const cliPython = process.env.HERMES_CLI_PYTHON; // e.g. /root/.hermes/hermes-agent/venv/bin/python
  const cliScript = process.env.HERMES_CLI_SCRIPT || '/root/.hermes/hermes-agent/hermes_cli/main.py';
  const cliTarget = process.env.HERMES_CLI_TARGET; // e.g. telegram:Исмаил (dm)

  const webhookUrl = process.env.HERMES_WEBHOOK_URL;
  const webhookSecret = process.env.HERMES_WEBHOOK_SECRET;

  if ((!tgToken || !tgChatId) && (!cliPython || !cliTarget) && (!webhookUrl || !webhookSecret)) {
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

      if (tgToken && tgChatId) {
        const messageText = formatHermesMessage(row.event_type, envelope);
        const replyMarkup = buildHermesReplyMarkup(row.event_type, envelope);
        const resp = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: tgChatId,
            text: messageText,
            disable_web_page_preview: true,
            reply_markup: replyMarkup,
          }),
          signal: AbortSignal.timeout(10000),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || !data.ok) {
          throw new Error(data.description || `Telegram HTTP ${resp.status}`);
        }
      } else if (cliPython && cliTarget) {
        // Fallback: safe local delivery via Hermes CLI `hermes send --to`
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
      const errMsg = String(err.message || err).slice(0, 500);
      console.error(`[Hermes Dispatch Error] event=${row.event_id} type=${row.event_type} attempt=${row.attempts + 1}:`, errMsg);
      db.prepare(`
        UPDATE hermes_events SET attempts = attempts + 1, last_error = ?,
        status = CASE WHEN attempts + 1 >= 5 THEN 'failed' ELSE 'pending' END
        WHERE id = ?
      `).run(errMsg, row.id);
    }
  }

  return { dispatched };
}

/**
 * Checks for pending submissions older than 24 hours and sends a daily Telegram
 * reminder with inline Approve/Reject buttons (at most once every 23 hours unless forced).
 */
export async function sendPendingReminders(db, { force = false } = {}) {
  const overdue = db.prepare(`
    SELECT submission_uid, organization_name, normalized_domain, category_id, created_at
    FROM submissions
    WHERE status = 'pending'
      AND datetime(created_at) <= datetime('now', '-24 hours')
    ORDER BY created_at ASC
  `).all();

  if (overdue.length === 0) {
    return { reminded: 0, pendingCount: 0 };
  }

  if (!force) {
    const recent = db.prepare(`
      SELECT id FROM audit_logs
      WHERE action = 'reminder.pending_submissions'
        AND datetime(created_at) > datetime('now', '-23 hours')
      LIMIT 1
    `).get();
    if (recent) {
      return { reminded: 0, pendingCount: overdue.length, skipped: 'cooldown' };
    }
  }

  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_HOME_CHANNEL;
  const adminUrl = process.env.ADMIN_PANEL_URL || 'https://www.aitopindex.com/admin';

  if (!tgToken || !tgChatId) {
    console.error('[Pending Reminder Error] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured');
    return { reminded: 0, pendingCount: overdue.length, skipped: 'unconfigured' };
  }

  const lines = [
    `⏰ Напоминание: ${overdue.length} заявок ожидают модерации более 24 часов`,
    '',
    ...overdue.slice(0, 10).map(
      (s, i) => `${i + 1}. ${s.organization_name} (${s.normalized_domain}) — ${s.submission_uid} от ${s.created_at}`
    ),
    '',
    `Админка: ${adminUrl}`,
  ];

  const inlineKeyboard = overdue.slice(0, 5).map((s) => [
    { text: `✅ Одобрить ${s.organization_name.slice(0, 18)}`, callback_data: `ati:sub_approve:${s.submission_uid}` },
    { text: `❌ Отклонить`, callback_data: `ati:sub_reject:${s.submission_uid}` },
  ]);

  const resp = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: tgChatId,
      text: lines.join('\n'),
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: inlineKeyboard },
    }),
    signal: AbortSignal.timeout(10000),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) {
    const errText = data.description || `Telegram HTTP ${resp.status}`;
    console.error('[Pending Reminder Error]', errText);
    throw new Error(errText);
  }

  db.prepare(`
    INSERT INTO audit_logs (actor, action, entity_type, entity_id, details_json)
    VALUES ('scheduler', 'reminder.pending_submissions', 'system', 'submissions', ?)
  `).run(JSON.stringify({ count: overdue.length, ids: overdue.map((s) => s.submission_uid) }));

  return { reminded: overdue.length, pendingCount: overdue.length };
}
