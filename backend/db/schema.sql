-- AITopIndex Production Database Schema (SQLite / PostgreSQL compatible design)

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_domain TEXT NOT NULL UNIQUE,
  website TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'integrator', -- 'integrator' | 'platform'
  region TEXT NOT NULL DEFAULT 'global',          -- 'usa-eu' | 'cis-mena' | 'global'
  hq_en TEXT NOT NULL DEFAULT '',
  hq_ru TEXT NOT NULL DEFAULT '',
  categories_json TEXT NOT NULL DEFAULT '[]',     -- JSON array of CategoryId
  tech_stack_json TEXT NOT NULL DEFAULT '[]',     -- JSON array of tech tags
  description_en TEXT NOT NULL DEFAULT '',
  description_ru TEXT NOT NULL DEFAULT '',
  min_budget_en TEXT NOT NULL DEFAULT '',
  min_budget_ru TEXT NOT NULL DEFAULT '',
  avg_roi_en TEXT NOT NULL DEFAULT '',
  avg_roi_ru TEXT NOT NULL DEFAULT '',
  deployed_agents_en_json TEXT NOT NULL DEFAULT '[]',
  deployed_agents_ru_json TEXT NOT NULL DEFAULT '[]',
  verification_status TEXT NOT NULL DEFAULT 'listed', -- 'listed' | 'verified' | 'ranked'
  publication_status TEXT NOT NULL DEFAULT 'draft',   -- 'published' | 'draft' | 'archived'
  source TEXT NOT NULL DEFAULT 'manual',
  verified_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(normalized_domain);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(publication_status);

-- Get Listed: Organization Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_uid TEXT NOT NULL UNIQUE,
  organization_name TEXT NOT NULL,
  normalized_domain TEXT NOT NULL,
  website_url TEXT NOT NULL,
  category_id TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT NOT NULL DEFAULT '',
  work_email TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  source TEXT NOT NULL DEFAULT 'web_get_listed',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'under_review' | 'approved' | 'rejected' | 'duplicate'
  moderator_notes TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_submissions_domain ON submissions(normalized_domain);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Find an AI Partner: Client B2B Leads
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_uid TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  required_solution TEXT NOT NULL,
  project_description TEXT NOT NULL,
  estimated_budget TEXT NOT NULL DEFAULT '',
  desired_start_date TEXT NOT NULL DEFAULT '',
  consent_gdpr INTEGER NOT NULL DEFAULT 0,
  lang TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'new', -- 'new' | 'qualified' | 'in_progress' | 'closed_won' | 'closed_lost' | 'spam'
  matched_company_ids_json TEXT NOT NULL DEFAULT '[]',
  moderator_notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Specialists Registry (Future-ready)
CREATE TABLE IF NOT EXISTS specialists (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role_en TEXT NOT NULL DEFAULT '',
  role_ru TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  bio_en TEXT NOT NULL DEFAULT '',
  bio_ru TEXT NOT NULL DEFAULT '',
  skills_json TEXT NOT NULL DEFAULT '[]',
  source_url TEXT NOT NULL DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'verified'
  publication_status TEXT NOT NULL DEFAULT 'draft',    -- 'published' | 'draft' | 'archived'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Email Notification Queue (Resilient to SMTP outages)
CREATE TABLE IF NOT EXISTS email_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at TEXT
);

-- Hermes Agent Event Outbox
CREATE TABLE IF NOT EXISTS hermes_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL, -- 'listing.submitted' | 'lead.created'
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'delivered' | 'failed'
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  delivered_at TEXT
);

-- Admin & Moderation Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
