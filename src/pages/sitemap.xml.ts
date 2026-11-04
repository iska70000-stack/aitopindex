import type { APIRoute } from 'astro';
import { agencies, categories, SITE } from '../lib/data';

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().slice(0, 10);

  interface SitemapUrl {
    loc: string;
    en: string;
    ru: string;
    priority: string;
    changefreq: string;
    lastmod: string;
  }

  const entries: SitemapUrl[] = [];

  // 1. Root & Homepages
  entries.push({
    loc: `${SITE}/en/`,
    en: `${SITE}/en/`,
    ru: `${SITE}/ru/`,
    priority: '1.0',
    changefreq: 'daily',
    lastmod: today,
  });
  entries.push({
    loc: `${SITE}/ru/`,
    en: `${SITE}/en/`,
    ru: `${SITE}/ru/`,
    priority: '1.0',
    changefreq: 'daily',
    lastmod: today,
  });

  // 2. Submit pages
  entries.push({
    loc: `${SITE}/en/submit/`,
    en: `${SITE}/en/submit/`,
    ru: `${SITE}/ru/submit/`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: today,
  });
  entries.push({
    loc: `${SITE}/ru/submit/`,
    en: `${SITE}/en/submit/`,
    ru: `${SITE}/ru/submit/`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: today,
  });

  // 3. Methodology pages
  entries.push({
    loc: `${SITE}/en/methodology/`,
    en: `${SITE}/en/methodology/`,
    ru: `${SITE}/ru/methodology/`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: today,
  });
  entries.push({
    loc: `${SITE}/ru/methodology/`,
    en: `${SITE}/en/methodology/`,
    ru: `${SITE}/ru/methodology/`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: today,
  });

  // 4. Categories (9 categories x 2 langs)
  for (const cat of categories) {
    const enUrl = `${SITE}/en/${cat.slug.en}/`;
    const ruUrl = `${SITE}/ru/${cat.slug.ru}/`;

    entries.push({
      loc: enUrl,
      en: enUrl,
      ru: ruUrl,
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: today,
    });
    entries.push({
      loc: ruUrl,
      en: enUrl,
      ru: ruUrl,
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: today,
    });
  }

  // 5. Verified Agencies (80+ agencies x 2 langs)
  for (const a of agencies) {
    const enUrl = `${SITE}/en/agency/${a.id}/`;
    const ruUrl = `${SITE}/ru/agency/${a.id}/`;
    const lastmod = a.verifiedDate || today;

    entries.push({
      loc: enUrl,
      en: enUrl,
      ru: ruUrl,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod,
    });
    entries.push({
      loc: ruUrl,
      en: enUrl,
      ru: ruUrl,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod,
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${e.en}" />
    <xhtml:link rel="alternate" hreflang="ru" href="${e.ru}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${e.en}" />
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
