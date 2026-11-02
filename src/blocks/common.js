import { escapeHtml, inline } from '../html.js';
import { t } from '../labels.js';

const FIELD = /^([a-z-]+):\s*(.*?)\s*$/i;

/**
 * Splits a block body into `key: value` fields and the remaining item lines.
 * Unknown keys are errors; lines that are not fields go to `items` with their file line.
 */
export function readBlock(body, firstLine, allowed, lang) {
  const fields = {};
  const items = [];
  const errors = [];
  body.split(/\r?\n/).forEach((text, index) => {
    if (!text.trim()) return;
    const line = firstLine + index;
    const field = /^\S/.test(text) && !/^[-+!~]/.test(text) ? FIELD.exec(text) : null;
    if (field && allowed.includes(field[1])) fields[field[1]] = field[2];
    else if (field) errors.push({ line, message: t(lang, 'errField', { field: field[1] }) });
    else items.push({ text, line });
  });
  return { fields, items, errors };
}

/** "Grundlage: …" and "Quelle: …" under a block, the same as under a chart. */
export function renderFoot(fields, lang) {
  const rows = [
    fields.basis ? `<div class="vm-chart-basis">${escapeHtml(t(lang, 'chartBasis'))}: ${inline(fields.basis)}</div>` : '',
    fields.source ? `<div class="vm-chart-source">${escapeHtml(t(lang, 'chartSource'))}: ${inline(fields.source)}</div>` : '',
  ].join('');
  return rows ? `<div class="vm-chart-foot">${rows}</div>` : '';
}

export const renderSays = (says, className) => (says ? `<div class="${className}">${inline(says)}</div>` : '');
