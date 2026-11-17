import { agencies, type Agency, type Lang } from '../lib/data';
import { categories } from '../data/categories';

export interface CountryMeta {
  code: string;
  flag: string;
  name: Record<Lang, string>;
}

/** Extracts standardized country info from an agency's HQ string */
export function extractCountry(agency: Agency): CountryMeta {
  const hq = (agency.hq?.en || '').toLowerCase();

  if (hq.includes('usa') || hq.includes('united states') || hq.includes('san francisco') || hq.includes('new york')) {
    return { code: 'US', flag: '🇺🇸', name: { en: 'United States', ru: 'США' } };
  }
  if (hq.includes('uk') || hq.includes('london') || hq.includes('cambridge')) {
    return { code: 'UK', flag: '🇬🇧', name: { en: 'United Kingdom', ru: 'Великобритания' } };
  }
  if (hq.includes('russia') || hq.includes('moscow') || hq.includes('petersburg') || hq.includes('yekaterinburg') || hq.includes('chelyabinsk') || hq.includes('izhevsk')) {
    return { code: 'RU', flag: '🇷🇺', name: { en: 'Russia', ru: 'Россия' } };
  }
  if (hq.includes('canada') || hq.includes('toronto')) {
    return { code: 'CA', flag: '🇨🇦', name: { en: 'Canada', ru: 'Канада' } };
  }
  if (hq.includes('germany') || hq.includes('berlin')) {
    return { code: 'DE', flag: '🇩🇪', name: { en: 'Germany', ru: 'Германия' } };
  }
  if (hq.includes('poland') || hq.includes('wrocław')) {
    return { code: 'PL', flag: '🇵🇱', name: { en: 'Poland', ru: 'Польша' } };
  }
  if (hq.includes('cyprus') || hq.includes('nicosia')) {
    return { code: 'CY', flag: '🇨🇾', name: { en: 'Cyprus', ru: 'Кипр' } };
  }
  if (hq.includes('israel') || hq.includes('tel aviv')) {
    return { code: 'IL', flag: '🇮🇱', name: { en: 'Israel', ru: 'Израиль' } };
  }
  if (hq.includes('australia') || hq.includes('sydney')) {
    return { code: 'AU', flag: '🇦🇺', name: { en: 'Australia', ru: 'Австралия' } };
  }

  return {
    code: 'GLOBAL',
    flag: '🌐',
    name: { en: 'International', ru: 'Международная' },
  };
}

export interface PlatformStats {
  companiesCount: number;
  verifiedCompaniesCount: number;
  integratorsCount: number;
  platformsCount: number;
  specialistsCount: number;
  reviewsCount: number;
  categoriesCount: number;
  countriesCount: number;
  countryBreakdown: Array<{
    code: string;
    flag: string;
    name: Record<Lang, string>;
    count: number;
  }>;
  regionBreakdown: {
    'usa-eu': number;
    'cis-mena': number;
    global: number;
  };
}

let cachedStats: PlatformStats | null = null;

/** Single source of truth for real platform statistics computed directly from the database */
export function getPlatformStats(): PlatformStats {
  if (cachedStats) return cachedStats;

  const published = agencies.filter((a) => a.status === 'verified');
  const uniqueDomains = new Set<string>();
  const uniqueCompanies: Agency[] = [];

  for (const a of published) {
    const dom = (a.website || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!uniqueDomains.has(dom)) {
      uniqueDomains.add(dom);
      uniqueCompanies.push(a);
    }
  }

  const countryMap = new Map<string, { code: string; flag: string; name: Record<Lang, string>; count: number }>();

  let integratorsCount = 0;
  let platformsCount = 0;
  const regionBreakdown = { 'usa-eu': 0, 'cis-mena': 0, global: 0 };

  for (const a of uniqueCompanies) {
    if (a.entityType === 'platform') platformsCount++;
    else integratorsCount++;

    if (a.region === 'usa-eu') regionBreakdown['usa-eu']++;
    else if (a.region === 'cis-mena') regionBreakdown['cis-mena']++;
    else regionBreakdown.global++;

    const c = extractCountry(a);
    if (c.code !== 'GLOBAL') {
      const existing = countryMap.get(c.code);
      if (existing) {
        existing.count++;
      } else {
        countryMap.set(c.code, { ...c, count: 1 });
      }
    }
  }

  const countryBreakdown = Array.from(countryMap.values()).sort((a, b) => b.count - a.count);

  cachedStats = {
    companiesCount: uniqueCompanies.length,
    verifiedCompaniesCount: uniqueCompanies.length,
    integratorsCount,
    platformsCount,
    specialistsCount: 0, // Currently 0 verified individual specialist profiles in DB
    reviewsCount: 0, // Currently 0 published user reviews in DB
    categoriesCount: categories.length,
    countriesCount: countryBreakdown.length,
    countryBreakdown,
    regionBreakdown,
  };

  return cachedStats;
}
