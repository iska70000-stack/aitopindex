#!/usr/bin/env node
/**
 * AITopIndex — Automated Freshness Engine
 * ---------------------------------------------------------------------------
 * 1. Verifies every agency website (GET with redirects, bot-tolerant).
 * 2. Refreshes `verifiedDate` for reachable listings.
 * 3. Tracks consecutive failures in src/data/link-health.json and delists a
 *    listing to the reserve pool after FAIL_THRESHOLD consecutive failures.
 * 4. Promotes queued agencies from src/data/reserve.json (only if their link
 *    verifies), prioritising categories with fewer than MIN_PER_CATEGORY.
 * 5. Pings IndexNow (Bing, Yandex, Seznam, Naver via api.indexnow.org + Yandex).
 *
 * Usage:
 *   node scripts/auto-update.mjs                 # full run
 *   node scripts/auto-update.mjs --dry-run       # report only, write nothing
 *   node scripts/auto-update.mjs --no-ping       # skip IndexNow
 *   node scripts/auto-update.mjs --ping-only     # only ping IndexNow
 *   node scripts/auto-update.mjs --promote=5     # max promotions per run
 *
 * Env: SITE_URL (default https://aitopindex.com), INDEXNOW_KEY (optional; else
 *      read from public/<32-hex>.txt)
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src', 'data');
const AGENCIES = path.join(DATA, 'agencies.json');
const RESERVE = path.join(DATA, 'reserve.json');
const HEALTH = path.join(DATA, 'link-health.json');
const CATEGORIES_TS = path.join(DATA, 'categories.ts');

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const NO_PING = args.has('--no-ping');
const PING_ONLY = args.has('--ping-only');
const promoteArg = [...args].find((a) => a.startsWith('--promote='));
const MAX_PROMOTE = promoteArg ? Number(promoteArg.split('=')[1]) : 3;

const SITE = (process.env.SITE_URL || 'https://www.aitopindex.com').replace(/\/$/, '');
const FAIL_THRESHOLD = 3;
const MIN_PER_CATEGORY = 8;
const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;
const today = new Date().toISOString().slice(0, 10);

const log = (...m) => console.log('[auto-update]', ...m);
const readJson = async (p, fallback) => (existsSync(p) ? JSON.parse(await readFile(p, 'utf8')) : fallback);
const writeJson = async (p, v) => {
  if (DRY) return log(`(dry-run) would write ${path.relative(ROOT, p)}`);
  await writeFile(p, JSON.stringify(v, null, 2) + '\n', 'utf8');
};

/** Returns { ok, status, reason }. 401/403/405/429 = alive behind bot protection. */
async function checkUrl(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; AITopIndexBot/1.0; +https://aitopindex.com/en/methodology/)',
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
    });
    res.body?.cancel().catch(() => {});
    const alive = res.status < 400 || [401, 403, 405, 406, 429, 503].includes(res.status);
    return { ok: alive, status: res.status, reason: alive ? 'ok' : `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, status: 0, reason: e?.cause?.code || e?.name || String(e) };
  } finally {
    clearTimeout(timer);
  }
}

async function pool(items, worker) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await worker(items[idx], idx);
      }
    }),
  );
  return out;
}

async function parseCategorySlugs() {
  const src = await readFile(CATEGORIES_TS, 'utf8');
  const re = /id:\s*'([a-z]+)',\s*slug:\s*\{\s*en:\s*'([^']+)',\s*ru:\s*'([^']+)'\s*\}/g;
  const out = [];
  for (const m of src.matchAll(re)) out.push({ id: m[1], en: m[2], ru: m[3] });
  return out;
}

async function verifyAndRotate() {
  const agencies = await readJson(AGENCIES, []);
  const reserve = await readJson(RESERVE, []);
  const health = await readJson(HEALTH, {});

  log(`Checking ${agencies.length} listed agencies…`);
  const results = await pool(agencies, (a) => checkUrl(a.website));

  const keep = [];
  const delisted = [];
  agencies.forEach((a, idx) => {
    const r = results[idx];
    const h = health[a.id] || { failCount: 0 };
    if (r.ok) {
      h.failCount = 0;
      h.lastOk = today;
      a.verifiedDate = today;
      a.status = 'verified';
      keep.push(a);
    } else {
      h.failCount = (h.failCount || 0) + 1;
      h.lastError = `${today}: ${r.reason}`;
      log(`✗ ${a.name} (${a.website}) → ${r.reason} [fail ${h.failCount}/${FAIL_THRESHOLD}]`);
      if (h.failCount >= FAIL_THRESHOLD) {
        delisted.push({ ...a, status: 'unreachable', queueStatus: 'delisted', delistedOn: today });
      } else {
        keep.push(a); // keep previous verifiedDate — stays honest
      }
    }
    health[a.id] = h;
  });

  // ---- Promotion from reserve pool ---------------------------------------
  const count = (list, cat) => list.filter((a) => a.categories.includes(cat)).length;
  const queued = reserve
    .filter((r) => r.queueStatus === 'queued' && !keep.some((k) => k.id === r.id))
    .sort((a, b) => {
      const need = (x) => Math.min(...x.categories.map((c) => count(keep, c)));
      return need(a) - need(b) || (b.score || 0) - (a.score || 0);
    });

  const promoted = [];
  for (const cand of queued) {
    if (promoted.length >= MAX_PROMOTE) break;
    const r = await checkUrl(cand.website);
    if (!r.ok) {
      log(`↷ Reserve ${cand.name} not promoted (${r.reason})`);
      continue;
    }
    const { queueStatus, ...clean } = cand;
    keep.push({ ...clean, status: 'verified', verifiedDate: today });
    promoted.push(cand.id);
    log(`↑ Promoted ${cand.name}`);
  }

  const nextReserve = [
    ...reserve.filter((r) => !promoted.includes(r.id) && !delisted.some((d) => d.id === r.id)),
    ...delisted,
  ];

  const lowCats = [...new Set(keep.flatMap((a) => a.categories))].filter((c) => count(keep, c) < MIN_PER_CATEGORY);
  if (lowCats.length) log(`⚠ Categories below ${MIN_PER_CATEGORY}: ${lowCats.join(', ')}`);

  await writeJson(AGENCIES, keep);
  await writeJson(RESERVE, nextReserve);
  await writeJson(HEALTH, health);

  const failed = results.filter((r) => !r.ok).length;
  log(`Done: ${keep.length} listed · ${failed} failing · ${promoted.length} promoted · ${delisted.length} delisted`);
  return keep;
}

async function findIndexNowKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY;
  const files = await readdir(path.join(ROOT, 'public'));
  const f = files.find((x) => /^[a-f0-9]{32}\.txt$/.test(x));
  return f ? f.replace('.txt', '') : null;
}

async function pingIndexNow(agencies) {
  const key = await findIndexNowKey();
  if (!key) return log('No IndexNow key found — skipping ping.');
  const cats = await parseCategorySlugs();
  const urls = [`${SITE}/`];
  for (const lang of ['en', 'ru']) {
    urls.push(
      `${SITE}/${lang}/`,
      `${SITE}/${lang}/submit/`,
      `${SITE}/${lang}/methodology/`,
      `${SITE}/${lang}/about/`,
      `${SITE}/${lang}/privacy/`,
      `${SITE}/${lang}/terms/`
    );
    for (const c of cats) urls.push(`${SITE}/${lang}/${c[lang]}/`);
    for (const a of agencies) urls.push(`${SITE}/${lang}/agency/${a.id}/`);
  }
  urls.push(`${SITE}/llms.txt`, `${SITE}/llms-full.txt`, `${SITE}/sitemap.xml`);

  const body = JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${key}.txt`, urlList: urls });
  if (DRY) return log(`(dry-run) would ping IndexNow with ${urls.length} URLs`);
  for (const endpoint of ['https://api.indexnow.org/indexnow', 'https://yandex.com/indexnow']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body });
      log(`IndexNow ${endpoint} → HTTP ${res.status} (${urls.length} URLs)`);
    } catch (e) {
      log(`IndexNow ${endpoint} failed: ${e?.message || e}`);
    }
  }
}

const agencies = PING_ONLY ? await readJson(AGENCIES, []) : await verifyAndRotate();
if (!NO_PING) await pingIndexNow(agencies);
