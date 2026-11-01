import { escapeHtml } from './html.js';
import { t } from './labels.js';
export const STALE_DAYS = 7;
const months = {
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
export function renderBand(visual, today, lang) {
  if (!visual?.stand && !visual?.status) return '';
  const language = lang === 'en' ? 'en' : 'de';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(visual.stand ?? '');
  let date = visual.stand;
  let stale = false;
  if (match) {
    const [, year, month, day] = match.map(Number);
    const timestamp = Date.UTC(year, month - 1, day);
    const parsed = new Date(timestamp);
    if (parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day) {
      date = `${day}${language === 'de' ? '.' : ''} ${months[language][month - 1]} ${year}`;
      stale = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - timestamp > STALE_DAYS * 86400000;
    }
  }
  const status = visual.status ? `<span class="vm-band-status">${escapeHtml(visual.status)}</span>` : '';
  const stand = visual.stand ? `<span>${escapeHtml(t(lang, 'stand', { date }))}</span>` : '';
  const warning = stale ? `<span>${escapeHtml(t(lang, 'stale', { days: STALE_DAYS }))}</span>` : '';
  return `<div class="vm-band${stale ? ' vm-stale' : ''}">${status}${stand}${warning}</div>`;
}
