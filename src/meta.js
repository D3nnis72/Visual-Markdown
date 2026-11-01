import { escapeHtml, inline } from './html.js';
import { t } from './labels.js';
import { COPY_ICON, TAG_ICON, UPDATED_ICON } from './icons.js';
import { STALE_DAYS, parseDate, formatDate, isStale } from './dates.js';

export const badge = (className, icon, content, title) =>
  `<span class="vm-badge ${className}"${title ? ` title="${escapeHtml(title)}"` : ''}>${icon}${content}</span>`;

export const idBadge = (id, lang) =>
  badge('vm-id-badge', TAG_ICON, `<code class="vm-id" title="${escapeHtml(t(lang, 'identifier'))}">${escapeHtml(id)}</code>`);

/** Last change as a short date; old or missing dates use the warning color. */
export function updatedBadge(value, lang, today) {
  if (!value) return badge('vm-updated vm-date-missing', UPDATED_ICON, escapeHtml(t(lang, 'noDate')), t(lang, 'noDate'));
  const date = parseDate(value);
  const shown = date ? formatDate(date, lang, { short: true, today }) : value;
  const title = t(lang, 'updated', { date: shown });
  return date && isStale(date, today)
    ? badge('vm-updated vm-date-stale', UPDATED_ICON, inline(shown), `${title}, ${t(lang, 'stale', { days: STALE_DAYS })}`)
    : badge('vm-updated', UPDATED_ICON, inline(shown), title);
}

export const copyButton = ({ id = null, thread = null, lang, className = '', label }) =>
  `<button type="button" class="vm-copy${className ? ` ${className}` : ''}"${id ? ` data-copy-id="${escapeHtml(id)}"` : ''} data-copied="${escapeHtml(t(lang, 'copied'))}" title="${escapeHtml(t(lang, 'copy'))}" aria-label="${escapeHtml(label)}"${thread ? ` data-copy-thread="${escapeHtml(thread)}"` : ''}>${COPY_ICON}</button>`;
