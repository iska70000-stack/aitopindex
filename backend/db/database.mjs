import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { normalizeDomain, hashPassword } from '../lib/security.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_DB_PATH = process.env.AITOPINDEX_DB_PATH || path.join(__dirname, 'aitopindex.sqlite');

let dbInstance = null;

export function getDb(dbPath = DEFAULT_DB_PATH) {
  if (dbInstance) return dbInstance;

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schemaSql);

  dbInstance = db;
  seedInitialData(db);
  return db;
}

function seedInitialData(db) {
  const countRow = db.prepare('SELECT COUNT(*) AS cnt FROM companies').get();
  if (countRow && countRow.cnt === 0) {
    const insertCompany = db.prepare(`
      INSERT OR IGNORE INTO companies (
        id, name, normalized_domain, website, entity_type, region,
        hq_en, hq_ru, categories_json, tech_stack_json,
        description_en, description_ru, min_budget_en, min_budget_ru,
        avg_roi_en, avg_roi_ru, deployed_agents_en_json, deployed_agents_ru_json,
        verification_status, publication_status, source, verified_date
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    // 1. Seed 86 published companies from agencies.json
    const agenciesPath = path.join(PROJECT_ROOT, 'src/data/agencies.json');
    if (fs.existsSync(agenciesPath)) {
      const agencies = JSON.parse(fs.readFileSync(agenciesPath, 'utf8'));
      for (const a of agencies) {
        const domain = normalizeDomain(a.website) || `${a.id}.invalid`;
        insertCompany.run(
          a.id,
          a.name,
          domain,
          a.website,
          a.entityType || 'integrator',
          a.region || 'global',
          a.hq?.en || '',
          a.hq?.ru || '',
          JSON.stringify(a.categories || []),
          JSON.stringify(a.techStack || []),
          a.description?.en || '',
          a.description?.ru || '',
          a.minProjectBudget?.en || '',
          a.minProjectBudget?.ru || '',
          a.avgRoiTime?.en || '',
          a.avgRoiTime?.ru || '',
          JSON.stringify(a.deployedAgents?.en || []),
          JSON.stringify(a.deployedAgents?.ru || []),
          a.status === 'verified' ? 'verified' : 'listed',
          a.status === 'verified' ? 'published' : 'draft',
          'agencies.json',
          a.verifiedDate || null
        );
      }
    }

    // 2. Seed 58 candidate drafts from candidates_draft.json
    const candidatesPath = path.join(PROJECT_ROOT, 'src/data/candidates_draft.json');
    if (fs.existsSync(candidatesPath)) {
      const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
      for (const c of candidates) {
        const domain = normalizeDomain(c.domain || c.website);
        if (!domain) continue;
        const id = domain.replace(/\./g, '-');
        insertCompany.run(
          id,
          c.name,
          domain,
          c.website || `https://${domain}`,
          'platform',
          'global',
          '',
          '',
          JSON.stringify([]),
          JSON.stringify([]),
          c.descriptionEn || '',
          '',
          '',
          '',
          '',
          '',
          '[]',
          '[]',
          'listed',
          'draft',
          'candidates_draft.json',
          null
        );
      }
    }
  }

  // Ensure initial admin user exists if ADMIN_INIT_PASSWORD is provided (or dev fallback only when NODE_ENV !== 'production')
  const adminCount = db.prepare('SELECT COUNT(*) AS cnt FROM admin_users').get();
  if (adminCount && adminCount.cnt === 0) {
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_INIT_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'admin-dev-local-change-me' : '');
    if (adminPass) {
      db.prepare('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)').run(
        adminUser,
        hashPassword(adminPass),
        'superadmin'
      );
    }
  }
}

export function logAudit(db, { actor, action, entityType, entityId, details = {} }) {
  db.prepare(`
    INSERT INTO audit_logs (actor, action, entity_type, entity_id, details_json)
    VALUES (?, ?, ?, ?, ?)
  `).run(actor, action, entityType, String(entityId), JSON.stringify(details));
}

export function exportPublishedAgenciesJson(db) {
  const rows = db.prepare(`
    SELECT * FROM companies WHERE publication_status = 'published' ORDER BY name ASC
  `).all();

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    website: r.website,
    type: r.entity_type === 'platform' ? 'platform' : 'agency',
    entityType: r.entity_type,
    region: r.region,
    categories: JSON.parse(r.categories_json || '[]'),
    markets: r.region === 'cis-mena' ? ['ru', 'en'] : ['global', 'en'],
    hq: { en: r.hq_en, ru: r.hq_ru || r.hq_en },
    minProjectBudget: { en: r.min_budget_en || 'Upon request', ru: r.min_budget_ru || 'По запросу' },
    avgRoiTime: { en: r.avg_roi_en || 'TBD', ru: r.avg_roi_ru || 'Уточняется' },
    deployedAgents: {
      en: JSON.parse(r.deployed_agents_en_json || '[]'),
      ru: JSON.parse(r.deployed_agents_ru_json || '[]'),
    },
    techStack: JSON.parse(r.tech_stack_json || '[]'),
    description: { en: r.description_en, ru: r.description_ru || r.description_en },
    score: 0,
    verifiedDate: r.verified_date || r.updated_at.slice(0, 10),
    status: 'verified',
  }));
}
