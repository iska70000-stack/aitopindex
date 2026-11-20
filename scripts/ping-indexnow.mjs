import fs from 'node:fs';
import path from 'node:path';

const HOST = 'www.aitopindex.com';
const KEY = 'topindex-network-key-2026-baku-cyprus';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const DIST_DIR = path.resolve(process.cwd(), 'dist');

function extractLocs(xml) {
  const urls = [];
  const regex = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

function collectSitemapUrls() {
  const candidates = [
    path.join(DIST_DIR, 'sitemap.xml'),
    path.join(DIST_DIR, 'sitemap-0.xml'),
  ];

  const urls = new Set();

  const indexFile = path.join(DIST_DIR, 'sitemap-index.xml');
  if (fs.existsSync(indexFile)) {
    const indexXml = fs.readFileSync(indexFile, 'utf8');
    for (const loc of extractLocs(indexXml)) {
      const filename = path.basename(new URL(loc).pathname);
      const childPath = path.join(DIST_DIR, filename);
      if (fs.existsSync(childPath)) {
        candidates.push(childPath);
      }
    }
  }

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const xml = fs.readFileSync(filePath, 'utf8');
    for (const loc of extractLocs(xml)) {
      if (loc.startsWith(`https://${HOST}/`)) {
        urls.add(loc);
      }
    }
  }

  return [...urls];
}

async function main() {
  const urlList = collectSitemapUrls();
  if (urlList.length === 0) {
    console.error('No URLs found in dist/sitemap*.xml. Run `npm run build` first.');
    process.exit(1);
  }

  console.log(`Found ${urlList.length} URLs in sitemap. Submitting to IndexNow...`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  console.log(`IndexNow HTTP status: ${response.status} ${response.statusText}`);
  if (body) {
    console.log(`Response body: ${body}`);
  }

  if (response.status !== 200 && response.status !== 202) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('IndexNow ping failed:', err);
  process.exit(1);
});
