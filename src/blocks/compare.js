import { escapeHtml, inline } from '../html.js';
import { t } from '../labels.js';
import { svg } from '../icons.js';
import { readBlock, renderSays } from './common.js';

export const COMPARE_FIELDS = ['says'];
export const COMPARE_RECOMMENDED = ['recommended', 'empfohlen'];
const OPTION = /^-\s+(.+)$/;
const PLUS_ICON = svg('vm-compare-icon', 13, '<path d="M8 3.5v9M3.5 8h9"/>');
const MINUS_ICON = svg('vm-compare-icon', 13, '<path d="M3.5 8h9"/>');

export function parseCompare(body, firstLine, lang) {
  const { fields, items, errors } = readBlock(body, firstLine, COMPARE_FIELDS, lang);
  const options = [];
  for (const { text, line } of items) {
    const option = /^\S/.test(text) ? OPTION.exec(text) : null;
    if (option) {
      const [title, ...flags] = option[1].split('|').map(part => part.trim());
      for (const flag of flags) {
        if (!COMPARE_RECOMMENDED.includes(flag.toLowerCase())) errors.push({ line, message: t(lang, 'errValue', { field: 'option', value: flag, list: COMPARE_RECOMMENDED.join(', ') }) });
      }
      options.push({ title, recommended: flags.some(flag => COMPARE_RECOMMENDED.includes(flag.toLowerCase())), text: [], pros: [], cons: [], line });
      continue;
    }
    const current = options[options.length - 1];
    const entry = text.trim();
    if (!current || !/^\s/.test(text)) { errors.push({ line, message: t(lang, 'errCompareLine') }); continue; }
    if (/^\+\s/.test(entry)) current.pros.push(entry.slice(2).trim());
    else if (/^-\s/.test(entry)) current.cons.push(entry.slice(2).trim());
    else current.text.push(entry);
  }
  if (!errors.length && (options.length < 2 || options.length > 4)) errors.push({ line: firstLine, message: t(lang, 'errCompareCount', { count: options.length }) });
  if (options.filter(option => option.recommended).length > 1) errors.push({ line: options.filter(option => option.recommended)[1].line, message: t(lang, 'errCompareRecommended') });
  return { fields, options, errors };
}

const list = (entries, kind, icon, label) => (entries.length
  ? `<ul class="vm-compare-list vm-compare-${kind}" aria-label="${escapeHtml(label)}">${entries.map(entry => `<li>${icon}<span>${inline(entry)}</span></li>`).join('')}</ul>`
  : '');

/** Two to four options side by side, pros and cons under each, the recommended one marked. */
export function renderCompare({ fields, options }, lang) {
  const columns = options.map(option => [
    `<div class="vm-compare-option${option.recommended ? ' vm-compare-recommended' : ''}">`,
    `<div class="vm-compare-head"><span class="vm-compare-title">${inline(option.title)}</span>`,
    option.recommended ? `<span class="vm-pill vm-pill-ok">${escapeHtml(t(lang, 'compareRecommended'))}</span>` : '',
    '</div>',
    option.text.length ? `<div class="vm-compare-text">${inline(option.text.join(' '))}</div>` : '',
    list(option.pros, 'pros', PLUS_ICON, t(lang, 'comparePros')),
    list(option.cons, 'cons', MINUS_ICON, t(lang, 'compareCons')),
    '</div>',
  ].join(''));
  return [`<div class="vm-compare">${renderSays(fields.says, 'vm-compare-says')}<div class="vm-compare-grid">${columns.join('')}</div></div>`, ''];
}

export function transformCompare(lines, start, end, lang) {
  const compare = parseCompare(lines.slice(start + 1, end).join('\n'), start + 2, lang);
  return compare.errors.length ? { errors: compare.errors } : { output: renderCompare(compare, lang) };
}
