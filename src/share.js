import { escapeHtml } from './html.js';
import { t } from './labels.js';
import { svg } from './icons.js';
import { parseDate, formatDate } from './dates.js';

/** Values of `share:` that mark a page as internal. Other values change nothing. */
export const SHARE_VALUES = ['intern', 'internal'];
export const isInternal = visual => SHARE_VALUES.includes(String(visual?.share ?? '').trim().toLowerCase());

const LOCK_ICON = svg('vm-lock-icon', 12, '<rect x="3.25" y="7" width="9.5" height="6.75" rx="1.5"/><path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2"/>');

export const shareBadge = lang => `<span class="vm-band-share">${LOCK_ICON}${escapeHtml(t(lang, 'shareInternal'))}</span>`;

// Text for a CSS string: no quote, backslash, line break or `<` that could end the string or the style tag.
const cssString = text => `"${String(text).replace(/[\\"<\r\n]/g, char => `\\${char.charCodeAt(0).toString(16)} `)}"`;

/**
 * A quiet line in the top margin of every PDF page, written as a page margin box so it never covers content.
 * The screen ignores `@page`, there the band badge is the marker.
 */
export function renderWatermark(visual, lang) {
  const asOf = visual?.['as-of'] ?? visual?.stand;
  const date = parseDate(asOf);
  const line = [t(lang, 'shareInternal').toUpperCase(), t(lang, 'watermarkNote'), asOf ? t(lang, 'stand', { date: date ? formatDate(date, lang) : asOf }) : ''].filter(Boolean).join(' · ');
  return `<style class="vm-watermark">@page { @top-right { content: ${cssString(line)}; font: 600 7.5pt ui-sans-serif, -apple-system, "Segoe UI", sans-serif; letter-spacing: 0.02em; color: #b3443a; } }</style>`;
}
