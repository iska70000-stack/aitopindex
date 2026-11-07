import type { APIRoute } from 'astro';
import { agencies, categories, LANGS, SITE, type Lang } from '../../lib/data';

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = async ({ params }) => {
  const lang = (params.lang || 'en') as Lang;
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

  // 1. Homepage for this language
  entries.push({
    loc: `${SITE}/${lang}/`,
    en: `${SITE}/en/`,
    ru: `${SITE}/ru/`,
    priority: '1.0',
    changefreq: 'daily',
    lastmod: today,
  });

  // 2. Core static pages for this language
  const staticPages: { slug: string; priority: string }[] = [
    { slug: 'submit', priority: '0.8' },
    { slug: 'methodology', priority: '0.7' },
    { slug: 'about', priority: '0.7' },
    { slug: 'privacy', priority: '0.5' },
    { slug: 'terms', priority: '0.5' },
  ];

  for (const p of staticPages) {
    entries.push({
      loc: `${SITE}/${lang}/${p.slug}/`,
      en: `${SITE}/en/${p.slug}/`,
      ru: `${SITE}/ru/${p.slug}/`,
      priority: p.priority,
      changefreq: 'monthly',
      lastmod: today,
    });
  }

  // 3. Categories for this language
  for (const cat of categories) {
    const enUrl = `${SITE}/en/${cat.slug.en}/`;
    const ruUrl = `${SITE}/ru/${cat.slug.ru}/`;
    entries.push({
      loc: lang === 'ru' ? ruUrl : enUrl,
      en: enUrl,
      ru: ruUrl,
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: today,
    });
  }

  // 4. Agencies for this language
  for (const a of agencies) {
    const enUrl = `${SITE}/en/agency/${a.id}/`;
    const ruUrl = `${SITE}/ru/agency/${a.id}/`;
    entries.push({
      loc: lang === 'ru' ? ruUrl : enUrl,
      en: enUrl,
      ru: ruUrl,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: a.verifiedDate || today,
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
