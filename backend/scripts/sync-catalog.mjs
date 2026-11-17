import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getDb, exportPublishedAgenciesJson, logAudit } from '../db/database.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const AGENCIES_PATH = path.join(PROJECT_ROOT, 'src/data/agencies.json');
const BACKUP_PATH = path.join(PROJECT_ROOT, 'src/data/agencies.json.bak');

export function syncCatalogSafely({
  force = false,
  actor = 'sync_script',
  verifyBuild = true,
  deploy = false,
} = {}) {
  // 1. Protect uncommitted manual editorial changes
  if (!force) {
    const dirty = execSync('git status --porcelain src/data/agencies.json', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    if (dirty) {
      throw new Error('src/data/agencies.json has uncommitted manual edits. Commit or pass --force before syncing.');
    }
  }

  // 2. Snapshot current agencies.json for instant rollback
  if (fs.existsSync(AGENCIES_PATH)) {
    fs.copyFileSync(AGENCIES_PATH, BACKUP_PATH);
  }

  const db = getDb();
  const exported = exportPublishedAgenciesJson(db);

  // Deduplicate check on normalized domain before writing
  const seenDomains = new Set();
  for (const item of exported) {
    const dom = String(item.website || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (seenDomains.has(dom)) {
      if (fs.existsSync(BACKUP_PATH)) fs.copyFileSync(BACKUP_PATH, AGENCIES_PATH);
      throw new Error(`Duplicate domain detected during export: ${dom}`);
    }
    seenDomains.add(dom);
  }

  fs.writeFileSync(AGENCIES_PATH, JSON.stringify(exported, null, 2), 'utf8');

  // 3. Verify Astro build; rollback automatically on failure
  if (verifyBuild) {
    try {
      execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    } catch (buildErr) {
      if (fs.existsSync(BACKUP_PATH)) {
        fs.copyFileSync(BACKUP_PATH, AGENCIES_PATH);
      }
      throw new Error(`Build verification failed; rolled back agencies.json. Details: ${buildErr.message}`);
    }
  }

  // 4. Optional production Git push & Vercel deployment (only when explicitly invoked with --deploy)
  if (deploy) {
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      throw new Error('VERCEL_TOKEN environment variable is required for --deploy');
    }
    try {
      execSync('git add src/data/agencies.json', { cwd: PROJECT_ROOT, stdio: 'pipe' });
      const staged = execSync('git diff --cached --name-only', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
      if (staged) {
        execSync('git commit -m "chore(catalog): sync published organizations from admin DB"', { cwd: PROJECT_ROOT, stdio: 'pipe' });
        execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'pipe' });
      }
      execSync(`npx vercel --prod --token "${vercelToken}" --yes`, { cwd: PROJECT_ROOT, stdio: 'pipe' });
    } catch (deployErr) {
      if (fs.existsSync(BACKUP_PATH)) {
        fs.copyFileSync(BACKUP_PATH, AGENCIES_PATH);
      }
      throw new Error(`Deployment failed; rolled back local agencies.json. Details: ${deployErr.message}`);
    }
  }

  if (fs.existsSync(BACKUP_PATH)) {
    fs.unlinkSync(BACKUP_PATH);
  }

  logAudit(db, {
    actor,
    action: deploy ? 'catalog.sync_and_deploy' : 'catalog.sync_verified',
    entityType: 'system',
    entityId: 'agencies.json',
    details: { exportedCount: exported.length, verifyBuild, deploy },
  });

  return { ok: true, exportedCount: exported.length, deployed: deploy };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const force = process.argv.includes('--force');
  const noBuild = process.argv.includes('--no-build');
  const deploy = process.argv.includes('--deploy');
  const res = syncCatalogSafely({ force, verifyBuild: !noBuild, deploy });
  console.log('[SYNC COMPLETE]', JSON.stringify(res));
}
