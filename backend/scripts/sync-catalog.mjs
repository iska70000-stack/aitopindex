import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getDb, exportPublishedAgenciesJson, logAudit } from '../db/database.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const AGENCIES_PATH = path.join(PROJECT_ROOT, 'src/data/agencies.json');
const BACKUP_PATH = path.join(PROJECT_ROOT, 'src/data/agencies.json.bak');

export function getCurrentVercelProdUrl(vercelToken) {
  try {
    const out = execSync(`npx vercel ls --prod --token "${vercelToken}"`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const match = out.match(/https:\/\/[a-z0-9-]+\.vercel\.app/i);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}

export function rollbackVercelProduction(targetDeploymentUrl, vercelToken) {
  if (!targetDeploymentUrl) {
    throw new Error('No previous Vercel deployment URL provided for rollback.');
  }
  execSync(`npx vercel rollback "${targetDeploymentUrl}" --token "${vercelToken}" --yes`, {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
  });
  return { ok: true, rolledBackTo: targetDeploymentUrl };
}

export function syncCatalogSafely({
  force = false,
  actor = 'sync_script',
  verifyBuild = true,
  deploy = false,
  simulateBuildFailure = false,
} = {}) {
  // 1. Protect uncommitted manual editorial changes
  if (!force) {
    const dirty = execSync('git status --porcelain src/data/agencies.json', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    if (dirty) {
      throw new Error('src/data/agencies.json has uncommitted manual edits. Commit or pass --force before syncing.');
    }
  }

  // 2. Snapshot current agencies.json for instant rollback
  const originalContent = fs.existsSync(AGENCIES_PATH) ? fs.readFileSync(AGENCIES_PATH, 'utf8') : null;
  if (originalContent !== null) {
    fs.writeFileSync(BACKUP_PATH, originalContent, 'utf8');
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
      if (simulateBuildFailure) {
        throw new Error('Simulated build failure for rollback test');
      }
      execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    } catch (buildErr) {
      if (fs.existsSync(BACKUP_PATH)) {
        fs.copyFileSync(BACKUP_PATH, AGENCIES_PATH);
        fs.unlinkSync(BACKUP_PATH);
      }
      throw new Error(`Build verification failed; rolled back agencies.json. Details: ${buildErr.message}`);
    }
  }

  // 4. Optional production Git push & Vercel deployment with automatic Vercel rollback on failure
  if (deploy) {
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      throw new Error('VERCEL_TOKEN environment variable is required for --deploy');
    }

    const previousProdUrl = getCurrentVercelProdUrl(vercelToken);

    try {
      execSync('git add src/data/agencies.json', { cwd: PROJECT_ROOT, stdio: 'pipe' });
      const staged = execSync('git diff --cached --name-only', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
      if (staged) {
        execSync('git commit -m "chore(catalog): sync published organizations from admin DB"', { cwd: PROJECT_ROOT, stdio: 'pipe' });
        execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'pipe' });
      }
      execSync(`npx vercel --prod --token "${vercelToken}" --yes`, { cwd: PROJECT_ROOT, stdio: 'pipe' });

      // Post-deploy smoke verification
      const smokeOut = execSync('curl -s -o /dev/null -w "%{http_code}" https://www.aitopindex.com/', { encoding: 'utf8' }).trim();
      if (smokeOut !== '200') {
        throw new Error(`Post-deploy smoke check returned HTTP ${smokeOut}`);
      }
    } catch (deployErr) {
      if (fs.existsSync(BACKUP_PATH)) {
        fs.copyFileSync(BACKUP_PATH, AGENCIES_PATH);
        fs.unlinkSync(BACKUP_PATH);
      }
      if (previousProdUrl) {
        try {
          rollbackVercelProduction(previousProdUrl, vercelToken);
        } catch (rbErr) {
          throw new Error(`Deploy failed (${deployErr.message}) AND Vercel rollback failed (${rbErr.message})`);
        }
      }
      throw new Error(`Deployment failed; rolled back agencies.json and Vercel production to ${previousProdUrl || 'previous'}. Details: ${deployErr.message}`);
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
