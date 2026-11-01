import { escapeHtml } from './html.js';
import { t } from './labels.js';
import { copyButton } from './meta.js';
import { STALE_DAYS, parseDate, formatDate, isStale } from './dates.js';

export function renderBand(visual, today, lang) {
  const asOf = visual?.['as-of'] ?? visual?.stand;
  const created = visual?.created;
  if (!asOf && !visual?.status && !created) return '';
  const asOfDate = parseDate(asOf);
  const createdDate = parseDate(created);
  const stale = Boolean(asOfDate && isStale(asOfDate, today));
  const status = visual.status ? `<span class="vm-band-status">${escapeHtml(visual.status)}</span>` : '';
  const stand = asOf ? `<span>${escapeHtml(t(lang, 'stand', { date: asOfDate ? formatDate(asOfDate, lang) : asOf }))}</span>` : '';
  const since = created ? `<span class="vm-band-created">${escapeHtml(t(lang, 'created', { date: createdDate ? formatDate(createdDate, lang) : created }))}</span>` : '';
  const warning = stale ? `<span>${escapeHtml(t(lang, 'stale', { days: STALE_DAYS }))}</span>` : '';
  const copy = copyButton({ lang, className: 'vm-copy-document', label: t(lang, 'copyDocument') });
  return `<div class="vm-band${stale ? ' vm-stale' : ''}">${status}${stand}${since}${warning}${copy}</div>`;
}
