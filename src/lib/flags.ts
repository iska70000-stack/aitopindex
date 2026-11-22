/**
 * Crisp inline vector SVG flags (24x16 viewBox) so country flags render cleanly
 * across Windows, macOS, Linux, iOS, and Android without degrading to "us"/"ru" text.
 */

const BASE_ATTR =
  'class="inline-block w-[18px] h-[12px] rounded-[2px] shadow-[0_0_0_1px_rgba(23,23,44,0.12)] shrink-0 align-middle" viewBox="0 0 24 16" aria-hidden="true"';

export const FLAG_SVGS: Record<string, string> = {
  US: `<svg ${BASE_ATTR}><rect width="24" height="16" fill="#fff"/><g fill="#b22234"><rect y="0" width="24" height="1.23"/><rect y="2.46" width="24" height="1.23"/><rect y="4.92" width="24" height="1.23"/><rect y="7.38" width="24" height="1.23"/><rect y="9.85" width="24" height="1.23"/><rect y="12.31" width="24" height="1.23"/><rect y="14.77" width="24" height="1.23"/></g><rect width="10.2" height="8.6" fill="#3c3b6e"/><g fill="#fff"><circle cx="2" cy="1.8" r="0.55"/><circle cx="4.2" cy="1.8" r="0.55"/><circle cx="6.4" cy="1.8" r="0.55"/><circle cx="8.6" cy="1.8" r="0.55"/><circle cx="3.1" cy="3.5" r="0.55"/><circle cx="5.3" cy="3.5" r="0.55"/><circle cx="7.5" cy="3.5" r="0.55"/><circle cx="2" cy="5.2" r="0.55"/><circle cx="4.2" cy="5.2" r="0.55"/><circle cx="6.4" cy="5.2" r="0.55"/><circle cx="8.6" cy="5.2" r="0.55"/><circle cx="3.1" cy="6.9" r="0.55"/><circle cx="5.3" cy="6.9" r="0.55"/><circle cx="7.5" cy="6.9" r="0.55"/></g></svg>`,

  UK: `<svg ${BASE_ATTR}><rect width="24" height="16" fill="#012169"/><path d="M0 0L24 16M24 0L0 16" stroke="#fff" stroke-width="3.2"/><path d="M0 0L24 16M24 0L0 16" stroke="#c8102e" stroke-width="1.5"/><path d="M12 0V16M0 8H24" stroke="#fff" stroke-width="5"/><path d="M12 0V16M0 8H24" stroke="#c8102e" stroke-width="3"/></svg>`,

  RU: `<svg ${BASE_ATTR}><rect width="24" height="5.34" y="0" fill="#ffffff"/><rect width="24" height="5.34" y="5.33" fill="#0039a6"/><rect width="24" height="5.34" y="10.66" fill="#d52b1e"/></svg>`,

  CA: `<svg ${BASE_ATTR}><rect width="24" height="16" fill="#ffffff"/><rect width="6" height="16" x="0" fill="#d80621"/><rect width="6" height="16" x="18" fill="#d80621"/><path d="M12 3.2l.9 2.3 1.7-.7-.6 2.1 1.7.6-.8 1.2 1 .6-1.9.8.3 1.3-1.9-.3v2h-.8v-2l-1.9.3.3-1.3-1.9-.8 1-.6-.8-1.2 1.7-.6-.6-2.1 1.7.7z" fill="#d80621"/></svg>`,

  DE: `<svg ${BASE_ATTR}><rect width="24" height="5.34" y="0" fill="#111111"/><rect width="24" height="5.34" y="5.33" fill="#dd0000"/><rect width="24" height="5.34" y="10.66" fill="#ffce00"/></svg>`,

  PL: `<svg ${BASE_ATTR}><rect width="24" height="8" y="0" fill="#ffffff"/><rect width="24" height="8" y="8" fill="#dc143c"/></svg>`,

  CY: `<svg ${BASE_ATTR}><rect width="24" height="16" fill="#ffffff"/><path d="M7.5 9.2c1.2-.5 2.4-1.3 3.7-1.5 1.3-.2 2.4-.9 3.6-1.8.8-.6 1.6-1 2.2-1.1-.4.9-1.2 1.7-1.8 2.4-.5.6-.7 1.3-1.5 1.7-1 .5-2.1.6-3.1 1.1-.9.4-2.1.3-3.1-.8z" fill="#d57800"/><path d="M9 12.2c1 .8 2.2 1.1 3 1.1s2-.3 3-1.1" fill="none" stroke="#4e5b31" stroke-width="1.1" stroke-linecap="round"/></svg>`,

  IL: `<svg ${BASE_ATTR}><rect width="24" height="16" fill="#ffffff"/><rect y="2" width="24" height="2" fill="#0038b8"/><rect y="12" width="24" height="2" fill="#0038b8"/><polygon points="12,5.1 14.5,9.5 9.5,9.5" fill="none" stroke="#0038b8" stroke-width="0.9"/><polygon points="12,10.9 14.5,6.5 9.5,6.5" fill="none" stroke="#0038b8" stroke-width="0.9"/></svg>`,

  AU: `<svg ${BASE_ATTR}><rect width="24" height="16" fill="#012169"/><g transform="scale(0.5)"><path d="M0 0L24 16M24 0L0 16" stroke="#fff" stroke-width="3.2"/><path d="M0 0L24 16M24 0L0 16" stroke="#c8102e" stroke-width="1.5"/><path d="M12 0V16M0 8H24" stroke="#fff" stroke-width="5"/><path d="M12 0V16M0 8H24" stroke="#c8102e" stroke-width="3"/></g><g fill="#fff"><circle cx="6" cy="12" r="1.4"/><circle cx="18" cy="4" r="0.9"/><circle cx="20.5" cy="7.2" r="0.85"/><circle cx="18" cy="12.5" r="1"/><circle cx="15.5" cy="8.2" r="0.85"/><circle cx="19.2" cy="9.6" r="0.55"/></g></svg>`,

  GLOBAL: `<svg class="inline-block w-[16px] h-[16px] text-[#6336ed] shrink-0 align-middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c4 4 4 14 0 18M12 3c-4 4-4 14 0 18"/></svg>`,
};

export function getFlagSvg(code: string): string {
  return FLAG_SVGS[code] || FLAG_SVGS.GLOBAL;
}

export function splitBudget(raw: string): { main: string; note: string } {
  const trimmed = String(raw || '').trim();
  const parenMatch = trimmed.match(/^([^(]+?)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    return { main: parenMatch[1].trim(), note: parenMatch[2].trim() };
  }
  const dotMatch = trimmed.match(/^(Enterprise)\s*[·•]\s*(.+)$/i);
  if (dotMatch) {
    return { main: dotMatch[1].trim(), note: dotMatch[2].trim() };
  }
  return { main: trimmed, note: '' };
}
