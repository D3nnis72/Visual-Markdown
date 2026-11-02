import { escapeHtml } from './html.js';
import { t } from './labels.js';
import { svg } from './icons.js';
import { parseDate, formatDate } from './dates.js';

/** Values of `share:` that mark a page as internal. Other values change nothing. */
export const SHARE_VALUES = ['intern', 'internal'];
export const isInternal = visual => SHARE_VALUES.includes(String(visual?.share ?? '').trim().toLowerCase());

const LOCK_ICON = svg('vm-lock-icon', 12, '<rect x="3.25" y="7" width="9.5" height="6.75" rx="1.5"/><path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2"/>');

export const shareBadge = lang => `<span class="vm-band-share">${LOCK_ICON}${escapeHtml(t(lang, 'shareInternal'))}</span>`;

/** Hidden on screen; the print styles repeat it on every PDF page. */
export function renderWatermark(visual, lang) {
  const asOf = visual?.['as-of'] ?? visual?.stand;
  const date = parseDate(asOf);
  const note = [t(lang, 'watermarkNote'), asOf ? t(lang, 'stand', { date: date ? formatDate(date, lang) : asOf }) : ''].filter(Boolean).join(' · ');
  return `<div class="vm-watermark" aria-hidden="true"><div class="vm-watermark-text"><span class="vm-watermark-word">${escapeHtml(t(lang, 'shareInternal'))}</span><span class="vm-watermark-note">${escapeHtml(note)}</span></div></div>`;
}
