import agenciesJson from '../data/agencies.json';
import {
  categories,
  categoryById,
  categoryBySlug,
  type Category,
  type CategoryId,
  type FaqItem,
  type Lang,
  type Localized,
} from '../data/categories';

export const SITE = 'https://aitopindex.com';
export const BRAND = 'AITopIndex';
export const LANGS: Lang[] = ['en', 'ru'];

export interface Agency {
  id: string;
  name: string;
  website: string;
  type: 'agency' | 'platform' | 'studio' | 'lab';
  categories: CategoryId[];
  markets: string[];
  hq: Localized;
  minProjectBudget: Localized;
  avgRoiTime: Localized;
  deployedAgents: Localized<string[]>;
  techStack: string[];
  description: Localized;
  score: number;
  verifiedDate: string;
  status: string;
}

export const agencies: Agency[] = (agenciesJson as Agency[])
  .filter((a) => a.status === 'verified')
  .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

export const agencyById = (id: string) => agencies.find((a) => a.id === id);

export const agenciesFor = (cat: CategoryId) => agencies.filter((a) => a.categories.includes(cat));

/** Ranked position of an agency inside a category (1-based). */
export const rankIn = (cat: CategoryId, id: string) => agenciesFor(cat).findIndex((a) => a.id === id) + 1;

/* ------------------------------------------------------------------ */
/* Stack filter pills                                                  */
/* ------------------------------------------------------------------ */
export const FILTERS: { key: string; label: string; match: RegExp }[] = [
  { key: 'n8n', label: 'n8n', match: /\bn8n\b/i },
  { key: 'make', label: 'Make', match: /^make$/i },
  { key: 'amocrm', label: 'AmoCRM', match: /amocrm/i },
  { key: 'bitrix24', label: 'Bitrix24', match: /bitrix/i },
  { key: 'hubspot', label: 'HubSpot', match: /hubspot/i },
  { key: 'vapi', label: 'Vapi Voice', match: /vapi|retell|bland|twilio|telephony|voice ai|elevenlabs/i },
  { key: 'runway', label: 'Runway / Sora', match: /runway|sora|kling|generative video/i },
  { key: 'rag', label: 'RAG / LangChain', match: /\brag\b|langchain|langgraph|llamaindex/i },
];

export const filterKeysFor = (a: Agency): string[] =>
  FILTERS.filter((f) => a.techStack.some((t) => f.match.test(t))).map((f) => f.key);

/* ------------------------------------------------------------------ */
/* Dates, plurals, helpers                                             */
/* ------------------------------------------------------------------ */
export const BUILD_DATE = new Date();
export const YEAR = BUILD_DATE.getFullYear();

export const latestVerified = (): string =>
  agencies.reduce((max, a) => (a.verifiedDate > max ? a.verifiedDate : max), '1970-01-01');

export const formatMonthYear = (iso: string, lang: Lang) => {
  const d = new Date(iso + 'T12:00:00Z');
  const s = d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  // ru-RU yields "ноябрь 2026 г." → "Ноябрь 2026"
  return (s.charAt(0).toUpperCase() + s.slice(1)).replace(/\s?г\.$/, '');
};

export const formatDate = (iso: string, lang: Lang) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });

/** Russian plural: pluralRu(72, ['компания','компании','компаний']) → 'компании' */
export function pluralRu(n: number, forms: [string, string, string]): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
}

export const plural = (lang: Lang, n: number, en: [string, string], ru: [string, string, string]) =>
  lang === 'ru' ? pluralRu(n, ru) : n === 1 ? en[0] : en[1];

/** Round down to the nearest 5 for “72+” style counters. */
export const roundedCount = (n: number) => (n >= 10 ? Math.floor(n / 5) * 5 : n);

export const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '');

export const url = (p: string) => `${SITE}${p.startsWith('/') ? p : '/' + p}`;

export const categoryPath = (lang: Lang, id: CategoryId) => `/${lang}/${categoryById(id).slug[lang]}/`;
export const agencyPath = (lang: Lang, id: string) => `/${lang}/agency/${id}/`;

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'ru' : 'en');

export { categories, categoryById, categoryBySlug };
export type { Category, CategoryId, FaqItem, Lang, Localized };
