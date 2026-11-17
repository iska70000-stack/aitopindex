import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB = path.join(__dirname, 'db/test_run.sqlite');
if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);

process.env.AITOPINDEX_DB_PATH = TEST_DB;
process.env.NODE_ENV = 'development';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_INIT_PASSWORD = 'test-secure-password-123';
process.env.SESSION_SECRET = 'test-session-secret-123';

const { server } = await import('./server.mjs');
const { getDb } = await import('./db/database.mjs');

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

try {
  // 1. Stats check
  const statsRes = await fetch(`${baseUrl}/api/stats`);
  assert.equal(statsRes.status, 200);
  const stats = await statsRes.json();
  assert.equal(stats.companiesCount, 86, 'Should seed 86 published companies');
  assert.equal(stats.draftsCount, 58, 'Should seed 58 candidate drafts');
  console.log('[PASS] 1. DB Seed & /api/stats:', stats);

  // 2. Invalid submission
  const badSub = await fetch(`${baseUrl}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organization_name: 'A', website_url: 'not-a-domain', work_email: 'bad' }),
  });
  assert.equal(badSub.status, 400);
  console.log('[PASS] 2. Invalid submission rejected with 400');

  // 3. Valid Get Listed submission (EN)
  const validSub = await fetch(`${baseUrl}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organization_name: 'Test Neural Systems',
      website_url: 'https://www.testneuralsystems.io/about',
      category_id: 'enterprise',
      description: 'Building enterprise RAG pipelines and compliance guardrails.',
      tech_stack: 'Python, LangChain',
      work_email: 'founders@testneuralsystems.io',
      lang: 'en',
    }),
  });
  assert.equal(validSub.status, 201);
  const subData = await validSub.json();
  assert.equal(subData.status, 'pending');
  assert.equal(subData.message, 'Application received. Our editorial team will review your submission.');
  console.log('[PASS] 3. Valid Get Listed saved as pending:', subData.submission_id);

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
  console.log('[PASS] 4. Duplicate domain submission blocked with 409');

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
  const leadData = await leadRes.json();
  assert.ok(leadData.lead_id.startsWith('LEAD-'));
  console.log('[PASS] 5. Client Lead saved:', leadData.lead_id);

  // 6. Unauthorized admin access check
  const unauthRes = await fetch(`${baseUrl}/api/admin/dashboard`);
  assert.equal(unauthRes.status, 401);
  console.log('[PASS] 6. Unauthenticated /api/admin/dashboard returns 401');

  // 7. Admin login & moderation approval
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'test-secure-password-123' }),
  });
  assert.equal(loginRes.status, 200);
  const cookie = loginRes.headers.get('set-cookie').split(';')[0];

  const listSubs = await fetch(`${baseUrl}/api/admin/submissions`, { headers: { Cookie: cookie } });
  const subsList = await listSubs.json();
  assert.equal(subsList.submissions.length, 1);
  const subRowId = subsList.submissions[0].id;

  const approveRes = await fetch(`${baseUrl}/api/admin/submissions/${subRowId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ status: 'approved', moderator_notes: 'Domain verified' }),
  });
  assert.equal(approveRes.status, 200);

  const statsAfter = await (await fetch(`${baseUrl}/api/stats`)).json();
  assert.equal(statsAfter.companiesCount, 87, 'Approved company should publish cleanly');
  console.log('[PASS] 7. Admin approval published unique company (count=87)');

  // 8. Check hermes_events, email_queue, audit_logs
  const db = getDb();
  const hermesCnt = db.prepare('SELECT COUNT(*) AS c FROM hermes_events').get().c;
  const emailCnt = db.prepare('SELECT COUNT(*) AS c FROM email_queue').get().c;
  const auditCnt = db.prepare('SELECT COUNT(*) AS c FROM audit_logs').get().c;
  assert.equal(hermesCnt, 2, 'Should enqueue 2 Hermes events (listing.submitted + lead.created)');
  assert.equal(emailCnt, 2, 'Should enqueue 2 admin emails');
  assert.ok(auditCnt >= 4, 'Should record audit logs');
  console.log(`[PASS] 8. Outbox & Audit verified (hermes=${hermesCnt}, email=${emailCnt}, audit=${auditCnt})`);
} finally {
  server.close();
  try { getDb().close(); } catch {}
  // Clean up test db files
  for (const ext of ['', '-shm', '-wal']) {
    try { if (fs.existsSync(TEST_DB + ext)) fs.unlinkSync(TEST_DB + ext); } catch {}
  }
}
