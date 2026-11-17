import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB = path.join(__dirname, 'db/test_run.sqlite');
const TEST_BACKUP_DIR = path.join(__dirname, 'db/test_backups');
for (const ext of ['', '-shm', '-wal']) {
  if (fs.existsSync(TEST_DB + ext)) fs.unlinkSync(TEST_DB + ext);
}

process.env.AITOPINDEX_DB_PATH = TEST_DB;
process.env.AITOPINDEX_BACKUP_DIR = TEST_BACKUP_DIR;
process.env.NODE_ENV = 'development';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_INIT_PASSWORD = 'test-secure-password-123';
process.env.SESSION_SECRET = 'test-session-secret-123';
// Simulate unreachable Email & Hermes endpoints to test resilience
process.env.RESEND_API_KEY = 're_unreachable_test';
process.env.ADMIN_ALERT_EMAIL = 'admin@example.com';
process.env.HERMES_WEBHOOK_URL = 'http://127.0.0.1:59999/unreachable';
process.env.HERMES_WEBHOOK_SECRET = 'hermes-test-secret';

const { server } = await import('./server.mjs');
const { getDb } = await import('./db/database.mjs');
const { runBackupAndVerify } = await import('./scripts/backup.mjs');

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

try {
  // 1. Stats check
  const statsRes = await fetch(`${baseUrl}/api/stats`);
  assert.equal(statsRes.status, 200);
  const stats = await statsRes.json();
  assert.equal(stats.companiesCount, 86);
  assert.equal(stats.draftsCount, 58);
  console.log('[PASS] 1. DB Seed & /api/stats (86 published, 58 drafts)');

  // 2. Invalid submission rejected
  const badSub = await fetch(`${baseUrl}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organization_name: 'A', website_url: 'not-a-domain', work_email: 'bad' }),
  });
  assert.equal(badSub.status, 400);
  console.log('[PASS] 2. Invalid submission rejected (400)');

  // 3. Valid Get Listed submission (RU) even when Hermes/Email unreachable
  const validSub = await fetch(`${baseUrl}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organization_name: 'Test Neural Systems',
      website_url: 'https://www.testneuralsystems.io/about',
      category_id: 'enterprise',
      description: 'Внедрение корпоративных RAG-систем и ИИ-агентов.',
      tech_stack: 'Python, LangChain',
      work_email: 'founders@testneuralsystems.io',
      lang: 'ru',
    }),
  });
  assert.equal(validSub.status, 201);
  const subData = await validSub.json();
  assert.equal(subData.status, 'pending');
  assert.equal(subData.message, 'Заявка получена. Наша редакция рассмотрит её.');
  console.log('[PASS] 3. Valid Get Listed saved despite unreachable Email/Hermes:', subData.submission_id);

  // 4. Duplicate submission check
  const dupSub = await fetch(`${baseUrl}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organization_name: 'Test Neural Systems Copy',
      website_url: 'testneuralsystems.io',
      category_id: 'enterprise',
      description: 'Duplicate domain submission test.',
      work_email: 'hi@testneuralsystems.io',
      lang: 'en',
    }),
  });
  assert.equal(dupSub.status, 409);
  console.log('[PASS] 4. Duplicate domain blocked (409)');

  // 5. Find an AI Partner Lead
  const leadRes = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_name: 'Acme Logistics',
      contact_name: 'Jane Doe',
      work_email: 'jane@acmelogistics.com',
      country: 'United States',
      industry: 'Logistics',
      required_solution: 'Voice AI & Call Center',
      project_description: 'Need automated voice dispatch for 500 daily carrier calls.',
      estimated_budget: '$15,000 - $30,000',
      consent_gdpr: true,
      lang: 'en',
    }),
  });
  assert.equal(leadRes.status, 201);
  console.log('[PASS] 5. Client Lead saved in separate leads table');

  // 6. Unauthorized & CSRF checks
  const unauthRes = await fetch(`${baseUrl}/api/admin/dashboard`);
  assert.equal(unauthRes.status, 401);

  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'test-secure-password-123' }),
  });
  assert.equal(loginRes.status, 200);
  const loginBody = await loginRes.json();
  const cookie = loginRes.headers.get('set-cookie').split(';')[0];
  assert.ok(loginBody.csrfToken, 'Login must issue CSRF token');

  const listSubs = await fetch(`${baseUrl}/api/admin/submissions`, { headers: { Cookie: cookie } });
  const subsList = await listSubs.json();
  const subRowId = subsList.submissions[0].id;

  // Attempt mutation WITHOUT CSRF token -> must return 403
  const noCsrfRes = await fetch(`${baseUrl}/api/admin/submissions/${subRowId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ status: 'approved' }),
  });
  assert.equal(noCsrfRes.status, 403);
  console.log('[PASS] 6. Auth (401) & CSRF protection (403) verified');

  // Mutation WITH valid CSRF token -> 200
  const approveRes = await fetch(`${baseUrl}/api/admin/submissions/${subRowId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': loginBody.csrfToken },
    body: JSON.stringify({ status: 'approved', moderator_notes: 'Domain verified' }),
  });
  assert.equal(approveRes.status, 200);

  const statsAfter = await (await fetch(`${baseUrl}/api/stats`)).json();
  assert.equal(statsAfter.companiesCount, 87);
  console.log('[PASS] 7. Admin moderation approved & published unique company (count=87)');

  // 8. Admin notifications & duplicates endpoints
  const notifRes = await fetch(`${baseUrl}/api/admin/notifications`, { headers: { Cookie: cookie } });
  assert.equal(notifRes.status, 200);
  const notifs = await notifRes.json();
  assert.equal(notifs.emails.length, 2);
  assert.equal(notifs.hermes.length, 2);
  console.log('[PASS] 8. Notification outbox endpoints verified');

  // 9. Hot Backup & Integrity Restore Verification
  const backupRes = runBackupAndVerify();
  assert.equal(backupRes.integrity, 'ok');
  assert.equal(backupRes.counts.companies, 145); // 86 + 58 drafts + 1 approved
  assert.equal(backupRes.counts.submissions, 1);
  assert.equal(backupRes.counts.leads, 1);
  console.log('[PASS] 9. Online SQLite Backup & Restore integrity verified:', backupRes.counts);
} finally {
  server.close();
  try { getDb().close(); } catch {}
  for (const ext of ['', '-shm', '-wal']) {
    try { if (fs.existsSync(TEST_DB + ext)) fs.unlinkSync(TEST_DB + ext); } catch {}
  }
  try { fs.rmSync(TEST_BACKUP_DIR, { recursive: true, force: true }); } catch {}
}
