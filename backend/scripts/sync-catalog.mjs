import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getDb, exportPublishedAgenciesJson, logAudit } from '../db/database.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const AGENCIES_PATH = path.join(PROJECT_ROOT, 'src/data/agencies.json');
const BACKUP_PATH = path.join(PROJECT_ROOT, 'src/data/agencies.json.bak');

export function syncCatalogSafely({ force = false, actor = 'sync_script', verifyBuild = true } = {}) {
  // 1. Protect uncommitted manual editorial changes
  if (!force) {
    try {
      const dirty = execSync('git status --porcelain src/data/agencies.json', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
      if (dirty) {
        throw new Error('src/data/agencies.json has uncommitted manual edits. Commit or pass --force before syncing.');
      }
    } catch (err) {
      if (err.message.includes('uncommitted manual edits')) throw err;
    }
  }

  // 2. Snapshot current agencies.json for instant rollback
  if (fs.existsSync(AGENCIES_PATH)) {
    fs.copyFileSync(AGENCIES_PATH, BACKUP_PATH);
  }

  const db = getDb();
  const exported = exportPublishedAgenciesJson(db);
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

  if (fs.existsSync(BACKUP_PATH)) {
    fs.unlinkSync(BACKUP_PATH);
  }

  logAudit(db, {
    actor,
    action: 'catalog.sync_verified',
    entityType: 'system',
    entityId: 'agencies.json',
    details: { exportedCount: exported.length, verifyBuild },
  });

  return { ok: true, exportedCount: exported.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const force = process.argv.includes('--force');
  const noBuild = process.argv.includes('--no-build');
  const res = syncCatalogSafely({ force, verifyBuild: !noBuild });
  console.log('[SYNC COMPLETE]', JSON.stringify(res));
}
