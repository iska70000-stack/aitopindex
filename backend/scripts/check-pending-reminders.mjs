import { getDb } from '../db/database.mjs';
import { dispatchHermesEvents, sendPendingReminders } from '../lib/notifications.mjs';

try {
  process.loadEnvFile?.(new URL('../.env', import.meta.url));
} catch {}

const db = getDb();
const force = process.argv.includes('--force');

const retryRes = await dispatchHermesEvents(db);
const reminderRes = await sendPendingReminders(db, { force });

console.log('[PENDING CHECK]', JSON.stringify({ retryRes, reminderRes }));
