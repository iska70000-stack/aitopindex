import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, logAudit, exportPublishedAgenciesJson } from './db/database.mjs';
import {
  normalizeDomain,
  slugifyId,
  isValidEmail,
  escapeHtml,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  RateLimiter,
} from './lib/security.mjs';
import { enqueueAdminEmail, enqueueHermesEvent, dispatchHermesEvents, processEmailQueue, sendPendingReminders } from './lib/notifications.mjs';
import { syncCatalogSafely } from './scripts/sync-catalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const PORT = Number(process.env.PORT || 4390);
const SESSION_SECRET = process.env.SESSION_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-local-session-secret-change-in-prod' : crypto.randomBytes(32).toString('hex'));
const ADMIN_PANEL_URL = process.env.ADMIN_PANEL_URL || 'https://www.aitopindex.com/admin';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const ATI_INTERNAL_SECRET = process.env.ATI_INTERNAL_SECRET || '';

const CATEGORY_ALIASES = {
  sales: 'sales',
  'ai sales agents & crm automation': 'sales',
  'ai-sales-crm-agents': 'sales',
  video: 'video',
  'ai video, commercials & film studios': 'video',
  'ai-video-film-production': 'video',
  voice: 'voice',
  'ai voice agents & call center automation': 'voice',
  'ai-voice-call-agents': 'voice',
  realestate: 'realestate',
  'ai agents for real estate & developers': 'realestate',
  'ai-for-real-estate': 'realestate',
  healthcare: 'healthcare',
  'ai automation for clinics, dental & medspas': 'healthcare',
  'ai-for-healthcare-clinics': 'healthcare',
  workflow: 'workflow',
  workflows: 'workflow',
  'n8n, make & autonomous workflow agencies': 'workflow',
  'n8n-make-workflow-agencies': 'workflow',
  ecommerce: 'ecommerce',
  'ai agents for e-commerce & marketplaces': 'ecommerce',
  'ai-for-ecommerce-retail': 'ecommerce',
  enterprise: 'enterprise',
  'enterprise rag, private llms & legal ai': 'enterprise',
  'enterprise-rag-custom-llms': 'enterprise',
  geo: 'geo',
  'geo (ai search optimization) & ai web studios': 'geo',
  'geo-ai-search-agencies': 'geo',
};

function normalizeCategoryId(raw) {
  const key = String(raw || '').trim().toLowerCase();
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key];
  if (key.includes('rag') || key.includes('enterprise') || key.includes('legal')) return 'enterprise';
  if (key.includes('sales') || key.includes('crm')) return 'sales';
  if (key.includes('video') || key.includes('film')) return 'video';
  if (key.includes('voice') || key.includes('call')) return 'voice';
  if (key.includes('real estate') || key.includes('недвижим')) return 'realestate';
  if (key.includes('health') || key.includes('clinic') || key.includes('медицин')) return 'healthcare';
  if (key.includes('n8n') || key.includes('make') || key.includes('workflow')) return 'workflow';
  if (key.includes('commerce') || key.includes('маркетплейс')) return 'ecommerce';
  if (key.includes('geo')) return 'geo';
  return 'enterprise';
}

function moderateSubmission(db, { sub, newStatus, actor, notes, categoryId }) {
  const canonicalCat = normalizeCategoryId(categoryId || sub.category_id);

  db.prepare(`
    UPDATE submissions
    SET status = ?, moderator_notes = ?, category_id = ?, reviewed_by = ?, reviewed_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `).run(newStatus, notes ?? sub.moderator_notes, canonicalCat, actor, sub.id);

  if (newStatus === 'approved') {
    const existing = db.prepare('SELECT id FROM companies WHERE normalized_domain = ?').get(sub.normalized_domain);
    const stackArr = sub.tech_stack
      ? sub.tech_stack.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8)
      : [];
    const today = new Date().toISOString().slice(0, 10);

    if (existing) {
      db.prepare(`
        UPDATE companies SET
          name = ?, categories_json = ?, tech_stack_json = ?, description_en = ?,
          verification_status = 'verified', publication_status = 'published',
          verified_date = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(
        sub.organization_name,
        JSON.stringify([canonicalCat]),
        JSON.stringify(stackArr),
        sub.description,
        today,
        existing.id
      );
    } else {
      const newId = slugifyId(sub.organization_name);
      db.prepare(`
        INSERT INTO companies (
          id, name, normalized_domain, website, entity_type, region,
          categories_json, tech_stack_json, description_en, description_ru,
          verification_status, publication_status, source, verified_date
        ) VALUES (?, ?, ?, ?, 'integrator', 'global', ?, ?, ?, ?, 'verified', 'published', ?, ?)
      `).run(
        newId,
        sub.organization_name,
        sub.normalized_domain,
        sub.website_url,
        JSON.stringify([canonicalCat]),
        JSON.stringify(stackArr),
        sub.description,
        sub.description,
        `submission:${sub.submission_uid}`,
        today
      );
    }

    if (sub.work_email) {
      enqueueAdminEmail(db, {
        recipient: sub.work_email,
        subject: sub.lang === 'ru'
          ? `Ваша компания ${sub.organization_name} одобрена в AITopIndex`
          : `${sub.organization_name} is now approved on AITopIndex`,
        bodyText: sub.lang === 'ru'
          ? `Здравствуйте!\n\nЗаявка ${sub.submission_uid} для ${sub.organization_name} (${sub.normalized_domain}) одобрена и опубликована в каталоге AITopIndex: https://www.aitopindex.com/ru/\n\nС уважением,\nКоманда AITopIndex`
          : `Hello,\n\nYour submission ${sub.submission_uid} for ${sub.organization_name} (${sub.normalized_domain}) has been approved and published on AITopIndex: https://www.aitopindex.com/\n\nBest regards,\nAITopIndex Editorial Team`,
      });
    }
  }

  logAudit(db, {
    actor,
    action: `submission.${newStatus}`,
    entityType: 'submission',
    entityId: sub.submission_uid,
    details: { domain: sub.normalized_domain, notes: notes ?? sub.moderator_notes, category: canonicalCat },
  });
}

function moderateLead(db, { lead, newStatus, actor, notes, matched }) {
  db.prepare(`
    UPDATE leads SET status = ?, moderator_notes = ?, matched_company_ids_json = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(newStatus, notes ?? lead.moderator_notes, matched ?? lead.matched_company_ids_json, lead.id);

  logAudit(db, {
    actor,
    action: `lead.${newStatus}`,
    entityType: 'lead',
    entityId: lead.lead_uid,
    details: { notes: notes ?? lead.moderator_notes },
  });
}

const db = getDb();
const submitLimiter = new RateLimiter(15 * 60 * 1000, 8);
const loginLimiter = new RateLimiter(15 * 60 * 1000, 10);

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const map = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      map[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return map;
}

function getAuthenticatedAdmin(req) {
  const cookies = parseCookies(req);
  const token = cookies.aitop_admin_session;
  if (!token) return null;
  return verifySessionToken(token, SESSION_SECRET);
}

function sendJson(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  res.end(body);
}

async function readJsonBody(req, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function renderAdminHtml() {
  const htmlPath = path.join(__dirname, 'admin.html');
  return fs.readFileSync(htmlPath, 'utf8');
}

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method || 'GET';

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    });
    res.end();
    return;
  }

  try {
    // 1. Health & Public Stats
    if (method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, service: 'aitopindex-backend' });
    }

    if (method === 'GET' && pathname === '/api/stats') {
      const pub = db.prepare("SELECT COUNT(*) AS c FROM companies WHERE publication_status = 'published'").get().c;
      const ver = db.prepare("SELECT COUNT(*) AS c FROM companies WHERE publication_status = 'published' AND verification_status = 'verified'").get().c;
      const drafts = db.prepare("SELECT COUNT(*) AS c FROM companies WHERE publication_status = 'draft'").get().c;
      const specs = db.prepare("SELECT COUNT(*) AS c FROM specialists WHERE publication_status = 'published'").get().c;
      return sendJson(res, 200, {
        companiesCount: pub,
        verifiedCompaniesCount: ver,
        draftsCount: drafts,
        specialistsCount: specs,
      });
    }

    // 2. Public POST /api/submissions (Get Listed)
    if (method === 'POST' && pathname === '/api/submissions') {
      const ip = getClientIp(req);
      if (!submitLimiter.check(ip)) {
        return sendJson(res, 429, { error: 'Too many submissions. Please wait a few minutes.' });
      }

      const body = await readJsonBody(req);
      if (body.website_hp) {
        // Silent honeypot drop
        return sendJson(res, 200, { ok: true, message: 'Application received. Our editorial team will review your submission.' });
      }

      const lang = body.lang === 'ru' ? 'ru' : 'en';
      const orgName = String(body.organization_name || '').trim();
      const rawWebsite = String(body.website_url || '').trim();
      const categoryId = String(body.category_id || '').trim();
      const description = String(body.description || '').trim();
      const techStack = String(body.tech_stack || '').trim();
      const caseStudyUrl = String(body.case_study_url || '').trim();
      const workEmail = String(body.work_email || '').trim().toLowerCase();
      const source = String(body.source || 'web_get_listed').trim().slice(0, 64);

      if (orgName.length < 2 || orgName.length > 150) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Укажите корректное название компании.' : 'Please enter a valid organization name.' });
      }

      const normDomain = normalizeDomain(rawWebsite);
      if (!normDomain) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Укажите корректный официальный домен (например, company.com).' : 'Please enter a valid official domain (e.g., company.com).' });
      }

      if (!categoryId || categoryId.length > 80) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Выберите основную категорию.' : 'Please select a primary category.' });
      }

      if (description.length < 15 || description.length > 1500) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Опишите услуги компании (от 15 до 1500 символов).' : 'Please describe your services (15 to 1500 characters).' });
      }

      if (techStack.length > 300 || (source === 'web_listing_form' && !techStack)) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Укажите инструменты компании (до 300 символов).' : 'Enter the tools your company uses (up to 300 characters).' });
      }

      if (caseStudyUrl || source === 'web_listing_form') {
        const url = URL.parse(caseStudyUrl);
        if (caseStudyUrl.length > 500 || !url || !['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
          return sendJson(res, 400, { error: lang === 'ru' ? 'Укажите действительную ссылку на опубликованный пример работы.' : 'Enter a valid link to a published example of your work.' });
        }
      }

      if (!isValidEmail(workEmail)) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Укажите корректный рабочий email.' : 'Please enter a valid work email address.' });
      }

      // Duplicate check against published/draft companies & active submissions
      const existingCompany = db.prepare('SELECT id, name, publication_status FROM companies WHERE normalized_domain = ?').get(normDomain);
      const existingSubmission = db.prepare("SELECT submission_uid, status FROM submissions WHERE normalized_domain = ? AND status IN ('pending', 'under_review')").get(normDomain);

      if (existingCompany && existingCompany.publication_status === 'published') {
        return sendJson(res, 409, {
          error: lang === 'ru'
            ? `Организация с доменом ${normDomain} (${existingCompany.name}) уже опубликована в каталоге.`
            : `An organization with domain ${normDomain} (${existingCompany.name}) is already published in the directory.`,
          code: 'DUPLICATE_COMPANY',
        });
      }

      if (existingSubmission) {
        return sendJson(res, 409, {
          error: lang === 'ru'
            ? `Заявка для домена ${normDomain} уже находится на рассмотрении (ID: ${existingSubmission.submission_uid}).`
            : `A submission for ${normDomain} is already under review (ID: ${existingSubmission.submission_uid}).`,
          code: 'DUPLICATE_SUBMISSION',
        });
      }

      const submissionUid = `SUB-${crypto.randomInt(100000, 999999)}`;
      const websiteUrl = `https://${normDomain}`;

      const result = db.prepare(`
        INSERT INTO submissions (
          submission_uid, organization_name, normalized_domain, website_url,
          category_id, description, tech_stack, case_study_url, work_email, lang, source, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(submissionUid, orgName, normDomain, websiteUrl, categoryId, description, techStack, caseStudyUrl, workEmail, lang, source);

      logAudit(db, {
        actor: 'public_form',
        action: 'submission.created',
        entityType: 'submission',
        entityId: submissionUid,
        details: { domain: normDomain, category: categoryId, ip },
      });

      // Enqueue Admin Email (resilient if SMTP/API is unconfigured)
      enqueueAdminEmail(db, {
        subject: `[AITopIndex] New Listing Submission: ${orgName} (${normDomain})`,
        bodyText: [
          `Type: Get Listed Submission`,
          `Company: ${orgName}`,
          `Domain: ${normDomain}`,
          `Category: ${categoryId}`,
          `Tools: ${techStack || '—'}`,
          `Example of work: ${caseStudyUrl || '—'}`,
          `Contact Email: ${workEmail}`,
          `Application ID: ${submissionUid}`,
          `Date: ${new Date().toISOString()}`,
          `Review in Admin Panel: ${ADMIN_PANEL_URL}`,
        ].join('\n'),
      });

      // Enqueue Hermes Event
      enqueueHermesEvent(db, 'listing.submitted', {
        submission_id: submissionUid,
        organization_name: orgName,
        normalized_domain: normDomain,
        category_id: categoryId,
        tech_stack: techStack,
        case_study_url: caseStudyUrl,
        status: 'pending',
        duplicate_check: existingCompany ? `Draft match: ${existingCompany.name}` : 'No exact match found',
        admin_url: ADMIN_PANEL_URL,
      });

      return sendJson(res, 201, {
        ok: true,
        submission_id: submissionUid,
        status: 'pending',
        message: lang === 'ru'
          ? 'Заявка получена. Наша редакция рассмотрит её.'
          : 'Application received. Our editorial team will review your submission.',
      });
    }

    // 2b. Public POST /api/contact (Contact Us / Обратная связь)
    if (method === 'POST' && pathname === '/api/contact') {
      const ip = getClientIp(req);
      if (!submitLimiter.check(ip)) {
        return sendJson(res, 429, { error: 'Too many requests. Please wait a few minutes.' });
      }

      const body = await readJsonBody(req);
      if (body.website_hp) {
        return sendJson(res, 200, { ok: true, message: 'Message sent. We will get back to you shortly.' });
      }

      const lang = body.lang === 'ru' ? 'ru' : 'en';
      const senderEmail = String(body.email || '').trim().toLowerCase();
      const subject = String(body.subject || '').trim();
      const message = String(body.message || '').trim();

      if (!isValidEmail(senderEmail)) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Укажите корректный email.' : 'Please enter a valid email address.' });
      }

      if (subject.length < 2 || subject.length > 150) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Выберите тему обращения.' : 'Please select a subject.' });
      }

      if (message.length < 5 || message.length > 3000) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Введите сообщение (от 5 до 3000 символов).' : 'Please enter a message (5 to 3000 characters).' });
      }

      const msgUid = `MSG-${crypto.randomInt(100000, 999999)}`;

      db.prepare(`
        INSERT INTO contact_messages (message_uid, sender_email, subject, message, lang, ip, status)
        VALUES (?, ?, ?, ?, ?, ?, 'new')
      `).run(msgUid, senderEmail, subject, message, lang, ip);

      logAudit(db, {
        actor: 'public_contact',
        action: 'contact.created',
        entityType: 'contact_message',
        entityId: msgUid,
        details: { subject, lang, ip },
      });

      enqueueAdminEmail(db, {
        recipient: 'hello@aitopindex.com',
        replyTo: senderEmail,
        subject: `[AITopIndex Contact] ${subject}`,
        bodyText: [
          `Type: Contact Us Message`,
          `From (Reply-To): ${senderEmail}`,
          `Subject: ${subject}`,
          `Language: ${lang.toUpperCase()}`,
          `Message ID: ${msgUid}`,
          `Date: ${new Date().toISOString()}`,
          ``,
          `Message:`,
          message,
        ].join('\n'),
      });

      enqueueHermesEvent(db, 'contact.created', {
        message_id: msgUid,
        sender_email: senderEmail,
        subject,
        message,
        lang,
      });

      return sendJson(res, 201, {
        ok: true,
        message_id: msgUid,
        message: lang === 'ru'
          ? 'Сообщение отправлено. Мы ответим в ближайшее время.'
          : 'Message sent. We will get back to you shortly.',
      });
    }

    // 3. Public POST /api/leads (Find an AI Partner)
    if (method === 'POST' && pathname === '/api/leads') {
      const ip = getClientIp(req);
      if (!submitLimiter.check(ip)) {
        return sendJson(res, 429, { error: 'Too many requests. Please try again later.' });
      }

      const body = await readJsonBody(req);
      if (body.website_hp) {
        return sendJson(res, 200, { ok: true, message: 'Request received.' });
      }

      const lang = body.lang === 'ru' ? 'ru' : 'en';
      const companyName = String(body.company_name || '').trim();
      const contactName = String(body.contact_name || '').trim();
      const workEmail = String(body.work_email || '').trim().toLowerCase();
      const country = String(body.country || '').trim();
      const industry = String(body.industry || '').trim();
      const requiredSolution = String(body.required_solution || '').trim();
      const projectDescription = String(body.project_description || '').trim();
      const estimatedBudget = String(body.estimated_budget || '').trim();
      const desiredStartDate = String(body.desired_start_date || '').trim();
      const consent = body.consent_gdpr === true || body.consent_gdpr === 'true';

      if (companyName.length < 2 || contactName.length < 2) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Укажите название компании и контактное имя.' : 'Please provide company name and contact name.' });
      }
      if (!isValidEmail(workEmail)) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Укажите корректный рабочий email.' : 'Please provide a valid work email.' });
      }
      if (!requiredSolution || projectDescription.length < 15) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Выберите тип решения и опишите задачу (от 15 символов).' : 'Please select a solution type and describe your project (min 15 chars).' });
      }
      if (!consent) {
        return sendJson(res, 400, { error: lang === 'ru' ? 'Необходимо согласие на обработку данных.' : 'Consent to data processing is required.' });
      }

      const leadUid = `LEAD-${crypto.randomInt(100000, 999999)}`;
      db.prepare(`
        INSERT INTO leads (
          lead_uid, company_name, contact_name, work_email, country, industry,
          required_solution, project_description, estimated_budget, desired_start_date,
          consent_gdpr, lang, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'new')
      `).run(
        leadUid, companyName, contactName, workEmail, country, industry,
        requiredSolution, projectDescription, estimatedBudget, desiredStartDate, lang
      );

      logAudit(db, {
        actor: 'public_form',
        action: 'lead.created',
        entityType: 'lead',
        entityId: leadUid,
        details: { companyName, requiredSolution, country, ip },
      });

      enqueueAdminEmail(db, {
        subject: `[AITopIndex] New AI Partner Lead: ${companyName} (${requiredSolution})`,
        bodyText: [
          `Type: Client Lead (Find an AI Partner)`,
          `Lead ID: ${leadUid}`,
          `Company: ${companyName}`,
          `Contact: ${contactName} <${workEmail}>`,
          `Country / Industry: ${country} / ${industry}`,
          `Solution Needed: ${requiredSolution}`,
          `Budget: ${estimatedBudget || 'Not specified'}`,
          `Timeline: ${desiredStartDate || 'Not specified'}`,
          `Review in Admin Panel: ${ADMIN_PANEL_URL}`,
        ].join('\n'),
      });

      enqueueHermesEvent(db, 'lead.created', {
        lead_id: leadUid,
        company_name: companyName,
        country,
        industry,
        required_solution: requiredSolution,
        estimated_budget: estimatedBudget,
        status: 'new',
        admin_url: ADMIN_PANEL_URL,
      });

      return sendJson(res, 201, {
        ok: true,
        lead_id: leadUid,
        message: lang === 'ru'
          ? 'Запрос получен. Наша команда подберёт подходящих верифицированных партнёров.'
          : 'Request received. Our team will review your requirements and match verified partners.',
      });
    }

    // 4. Admin Auth Routes
    if (method === 'POST' && pathname === '/api/admin/login') {
      const ip = getClientIp(req);
      if (!loginLimiter.check(ip)) {
        return sendJson(res, 429, { error: 'Too many login attempts.' });
      }
      const body = await readJsonBody(req);
      const username = String(body.username || '').trim();
      const password = String(body.password || '');

      const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
      if (!user || !verifyPassword(password, user.password_hash)) {
        return sendJson(res, 401, { error: 'Invalid credentials.' });
      }

      const exp = Date.now() + 24 * 60 * 60 * 1000;
      const jti = crypto.randomUUID();
      const csrfToken = crypto.randomBytes(24).toString('hex');
      const token = signSessionToken({ uid: user.id, username: user.username, role: user.role, jti, csrf: csrfToken, exp }, SESSION_SECRET);
      const isProd = process.env.NODE_ENV === 'production';
      const cookie = `aitop_admin_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400${isProd ? '; Secure' : ''}`;

      logAudit(db, { actor: user.username, action: 'admin.login', entityType: 'admin_user', entityId: user.id, details: { ip, jti } });
      return sendJson(res, 200, { ok: true, username: user.username, role: user.role, csrfToken }, { 'Set-Cookie': cookie });
    }

    if (method === 'POST' && pathname === '/api/admin/logout') {
      return sendJson(res, 200, { ok: true }, { 'Set-Cookie': 'aitop_admin_session=; HttpOnly; Path=/; Max-Age=0' });
    }

    if (method === 'GET' && pathname === '/api/admin/me') {
      const admin = getAuthenticatedAdmin(req);
      if (!admin) return sendJson(res, 401, { error: 'Unauthorized' });
      return sendJson(res, 200, { ok: true, admin: { username: admin.username, role: admin.role }, csrfToken: admin.csrf });
    }

    // 5. Protected Admin API Routes
    if (pathname.startsWith('/api/admin/')) {
      const admin = getAuthenticatedAdmin(req);
      if (!admin) {
        return sendJson(res, 401, { error: 'Authentication required' });
      }

      // CSRF Verification on all state-changing admin requests
      if (method === 'POST' || method === 'PATCH' || method === 'DELETE') {
        const reqCsrf = req.headers['x-csrf-token'];
        if (!reqCsrf || reqCsrf !== admin.csrf) {
          return sendJson(res, 403, { error: 'Invalid or missing CSRF token' });
        }
      }

      if (method === 'GET' && pathname === '/api/admin/dashboard') {
        const stats = {
          publishedCompanies: db.prepare("SELECT COUNT(*) AS c FROM companies WHERE publication_status = 'published'").get().c,
          draftCompanies: db.prepare("SELECT COUNT(*) AS c FROM companies WHERE publication_status = 'draft'").get().c,
          pendingSubmissions: db.prepare("SELECT COUNT(*) AS c FROM submissions WHERE status IN ('pending', 'under_review')").get().c,
          newLeads: db.prepare("SELECT COUNT(*) AS c FROM leads WHERE status IN ('new', 'qualified')").get().c,
          emailPending: db.prepare("SELECT COUNT(*) AS c FROM email_queue WHERE status = 'pending'").get().c,
          hermesPending: db.prepare("SELECT COUNT(*) AS c FROM hermes_events WHERE status = 'pending'").get().c,
        };
        return sendJson(res, 200, stats);
      }

      if (method === 'GET' && pathname === '/api/admin/submissions') {
        const statusFilter = url.searchParams.get('status') || '';
        const rows = statusFilter
          ? db.prepare('SELECT * FROM submissions WHERE status = ? ORDER BY id DESC').all(statusFilter)
          : db.prepare('SELECT * FROM submissions ORDER BY id DESC').all();
        return sendJson(res, 200, { submissions: rows });
      }

      const subMatch = pathname.match(/^\/api\/admin\/submissions\/(\d+)$/);
      if (method === 'PATCH' && subMatch) {
        const id = Number(subMatch[1]);
        const sub = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
        if (!sub) return sendJson(res, 404, { error: 'Submission not found' });

        const body = await readJsonBody(req);
        const newStatus = String(body.status || sub.status);
        const allowed = ['pending', 'under_review', 'approved', 'rejected', 'duplicate'];
        if (!allowed.includes(newStatus)) return sendJson(res, 400, { error: 'Invalid status' });

        const notes = body.moderator_notes !== undefined ? String(body.moderator_notes) : sub.moderator_notes;
        const categoryId = body.category_id ? String(body.category_id) : sub.category_id;

        moderateSubmission(db, { sub, newStatus, actor: admin.username, notes, categoryId });
        return sendJson(res, 200, { ok: true, status: newStatus });
      }

      if (method === 'GET' && pathname === '/api/admin/leads') {
        const rows = db.prepare('SELECT * FROM leads ORDER BY id DESC').all();
        return sendJson(res, 200, { leads: rows });
      }

      const leadMatch = pathname.match(/^\/api\/admin\/leads\/(\d+)$/);
      if (method === 'PATCH' && leadMatch) {
        const id = Number(leadMatch[1]);
        const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
        if (!lead) return sendJson(res, 404, { error: 'Lead not found' });

        const body = await readJsonBody(req);
        const newStatus = String(body.status || lead.status);
        const notes = body.moderator_notes !== undefined ? String(body.moderator_notes) : lead.moderator_notes;
        const matched = Array.isArray(body.matched_company_ids)
          ? JSON.stringify(body.matched_company_ids)
          : lead.matched_company_ids_json;

        moderateLead(db, { lead, newStatus, actor: admin.username, notes, matched });
        return sendJson(res, 200, { ok: true });
      }

      if (method === 'GET' && pathname === '/api/admin/companies') {
        const pubStatus = url.searchParams.get('publication_status') || '';
        const rows = pubStatus
          ? db.prepare('SELECT * FROM companies WHERE publication_status = ? ORDER BY name ASC').all(pubStatus)
          : db.prepare('SELECT * FROM companies ORDER BY publication_status DESC, name ASC').all();
        return sendJson(res, 200, { companies: rows });
      }

      if (method === 'POST' && pathname === '/api/admin/sync-json') {
        const exported = exportPublishedAgenciesJson(db);
        const targetPath = path.join(PROJECT_ROOT, 'src/data/agencies.json');
        fs.writeFileSync(targetPath, JSON.stringify(exported, null, 2), 'utf8');
        logAudit(db, {
          actor: admin.username,
          action: 'catalog.sync_json',
          entityType: 'system',
          entityId: 'agencies.json',
          details: { exportedCount: exported.length },
        });
        return sendJson(res, 200, { ok: true, exportedCount: exported.length });
      }

      if (method === 'GET' && pathname === '/api/admin/audit-logs') {
        const rows = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100').all();
        return sendJson(res, 200, { logs: rows });
      }

      if (method === 'GET' && pathname === '/api/admin/notifications') {
        const emails = db.prepare('SELECT id, recipient, subject, status, attempts, last_error, created_at, sent_at FROM email_queue ORDER BY id DESC LIMIT 50').all();
        const hermes = db.prepare('SELECT id, event_id, event_type, status, attempts, last_error, created_at, delivered_at FROM hermes_events ORDER BY id DESC LIMIT 50').all();
        return sendJson(res, 200, { emails, hermes });
      }

      if (method === 'GET' && pathname === '/api/admin/duplicates') {
        const dupSubs = db.prepare("SELECT * FROM submissions WHERE status = 'duplicate' ORDER BY id DESC").all();
        const dupNames = db.prepare("SELECT name, COUNT(*) AS cnt FROM companies GROUP BY LOWER(name) HAVING cnt > 1").all();
        return sendJson(res, 200, { duplicateSubmissions: dupSubs, duplicateNames: dupNames });
      }

      return sendJson(res, 404, { error: 'Admin API endpoint not found' });
    }

    // 5b. Internal Telegram / Hermes Moderation Endpoint (localhost + X-Internal-Secret)
    if (method === 'POST' && pathname === '/internal/moderation') {
      const providedSecret = String(req.headers['x-internal-secret'] || '');
      if (
        !ATI_INTERNAL_SECRET ||
        providedSecret.length !== ATI_INTERNAL_SECRET.length ||
        !crypto.timingSafeEqual(Buffer.from(providedSecret), Buffer.from(ATI_INTERNAL_SECRET))
      ) {
        return sendJson(res, 401, { ok: false, error: 'Unauthorized internal call' });
      }

      const body = await readJsonBody(req);
      const action = String(body.action || '');
      const targetId = String(body.targetId || '').trim();
      const actor = `telegram:${String(body.adminUserId || 'admin')}`;

      if (action === 'sub_approve' || action === 'sub_reject') {
        const sub = db.prepare('SELECT * FROM submissions WHERE submission_uid = ?').get(targetId);
        if (!sub) return sendJson(res, 404, { ok: false, error: `Submission ${targetId} not found` });

        const newStatus = action === 'sub_approve' ? 'approved' : 'rejected';
        moderateSubmission(db, { sub, newStatus, actor });

        if (newStatus === 'approved' && process.env.ATI_ENABLE_AUTO_SYNC !== 'false') {
          setImmediate(() => {
            try {
              syncCatalogSafely({
                force: true,
                actor,
                verifyBuild: true,
                deploy: Boolean(process.env.VERCEL_TOKEN),
              });
            } catch (syncErr) {
              console.error('[Telegram Auto-Sync Error]', syncErr.message);
            }
          });
        }

        return sendJson(res, 200, { ok: true, status: newStatus, targetId });
      }

      if (action === 'lead_work' || action === 'lead_spam') {
        const lead = db.prepare('SELECT * FROM leads WHERE lead_uid = ?').get(targetId);
        if (!lead) return sendJson(res, 404, { ok: false, error: `Lead ${targetId} not found` });

        const newStatus = action === 'lead_work' ? 'in_progress' : 'spam';
        moderateLead(db, { lead, newStatus, actor });
        return sendJson(res, 200, { ok: true, status: newStatus, targetId });
      }

      return sendJson(res, 400, { ok: false, error: 'Unknown moderation action' });
    }

    // 6. Serve Admin Panel HTML
    if (method === 'GET' && (pathname === '/admin' || pathname === '/admin/')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderAdminHtml());
      return;
    }

    return sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error('[Backend Error]', err);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
});

// Only bind listener when executed directly (allows importing in tests)
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`AITopIndex Backend listening on http://127.0.0.1:${PORT}`);

    // Retry pending Telegram/Hermes and email deliveries every 60s
    setInterval(() => {
      dispatchHermesEvents(db).catch((err) => console.error('[Hermes Retry Loop Error]', err));
      processEmailQueue(db).catch((err) => console.error('[Email Retry Loop Error]', err));
    }, 60 * 1000).unref();

    // Check every hour for unreviewed pending submissions > 24h (sends at most once per 24h)
    setTimeout(() => {
      sendPendingReminders(db).catch((err) => console.error('[Pending Reminder Error]', err));
    }, 15 * 1000).unref();
    setInterval(() => {
      sendPendingReminders(db).catch((err) => console.error('[Pending Reminder Error]', err));
    }, 60 * 60 * 1000).unref();
  });
}
