import { escapeHtml, inline } from '../html.js';
import { t } from '../labels.js';
import { CHART_TYPES, CHART_FIELDS, CHART_REQUIRED, CHART_VALUES, CHART_NEEDS, TOTAL_LABEL } from './schema.js';
import { tableAbove, parseNumber } from './table.js';
import { chartSpec, chartLegend } from './specs.js';

/** Reads `key: value` lines. Returns the fields and errors with file line numbers. */
export function parseChart(body, firstLine, lang) {
  const fields = {};
  const errors = [];
  body.split(/\r?\n/).forEach((text, index) => {
    if (!text.trim()) return;
    const line = firstLine + index;
    const match = /^([a-z-]+):\s*(.*?)\s*$/i.exec(text);
    if (!match || !CHART_FIELDS.includes(match[1])) {
      errors.push({ line, message: t(lang, 'errField', { field: match?.[1] ?? text.trim() }) });
      return;
    }
    fields[match[1]] = match[2];
  });
  for (const field of CHART_REQUIRED) {
    if (!fields[field]) errors.push({ line: firstLine, message: t(lang, 'errRequired', { field }) });
  }
  if (fields.type && !CHART_TYPES.includes(fields.type)) {
    errors.push({ line: firstLine, message: t(lang, 'errValue', { field: 'type', value: fields.type, list: CHART_TYPES.join(', ') }) });
  }
  for (const field of CHART_NEEDS[fields.type] ?? []) {
    if (!fields[field]) errors.push({ line: firstLine, message: t(lang, 'errRequired', { field }) });
  }
  for (const [field, allowed] of Object.entries(CHART_VALUES)) {
    if (fields[field] && !allowed.includes(fields[field])) {
      errors.push({ line: firstLine, message: t(lang, 'errValue', { field, value: fields[field], list: allowed.join(', ') }) });
    }
  }
  return { fields, errors };
}

/** Turns the table above the block into long rows `{ x, y, series, … }`, or errors. */
export function chartData(fields, table, firstLine, lang) {
  if (!table) return { errors: [{ line: firstLine - 1, message: t(lang, 'errNoTable') }] };
  const errors = [];
  const column = name => {
    const index = table.header.findIndex(head => head.toLowerCase() === name.toLowerCase());
    if (index < 0) errors.push({ line: firstLine, message: t(lang, 'errColumn', { column: name }) });
    return index;
  };
  const optional = name => (fields[name] ? column(fields[name]) : -1);
  const yNames = fields.y.split(',').map(name => name.trim()).filter(Boolean);
  const x = column(fields.x);
  const ys = yNames.map(column);
  const color = optional('color');
  const target = optional('target');
  const label = optional('label');
  const note = optional('note');
  if (fields.color && yNames.length > 1) errors.push({ line: firstLine, message: t(lang, 'errColorMulti') });
  if (errors.length) return { errors };
  const number = (row, index) => {
    const value = parseNumber(row.values[index], lang);
    if (Number.isNaN(value)) errors.push({ line: row.line, message: t(lang, 'errNumber', { value: row.values[index], column: table.header[index] }) });
    return Number.isNaN(value) ? null : value;
  };
  const rows = [];
  for (const row of table.rows) {
    const xValue = row.values[x] ?? '';
    const total = TOTAL_LABEL.test(xValue);
    if (total && fields.type !== 'waterfall' && fields.type !== 'kpi') continue;
    for (const index of ys) {
      const series = color >= 0 ? row.values[color] ?? '' : yNames.length > 1 ? table.header[index] : null;
      if (fields.type === 'kpi') {
        rows.push({ x: xValue, y: row.values[index] ?? '', note: note >= 0 ? row.values[note] ?? '' : null });
        continue;
      }
      const value = number(row, index);
      if (value === null && !(fields.type === 'waterfall' && total)) continue;
      const record = { x: xValue, y: value, series, total };
      if (target >= 0) record.target = number(row, target);
      if (label >= 0) record.label = row.values[label] ?? '';
      if (fields.type === 'scatter') record.xNumber = number(row, x);
      rows.push(record);
    }
  }
  const seriesCount = new Set(rows.map(row => row.series)).size;
  if (fields.type === 'scatter' && seriesCount > 3) errors.push({ line: firstLine, message: t(lang, 'errSeries', { max: 3 }) });
  return {
    errors, rows,
    xTitle: table.header[x],
    yTitle: yNames.length > 1 ? null : table.header[ys[0]],
    seriesTitle: color >= 0 ? table.header[color] : null,
  };
}

function renderKpis(rows) {
  return `<div class="vm-kpis">${rows.map(row => `<div class="vm-kpi"><div class="vm-kpi-label">${inline(row.x)}</div><div class="vm-kpi-value">${inline(row.y)}</div>${row.note ? `<div class="vm-kpi-note">${inline(row.note)}</div>` : ''}</div>`).join('')}</div>`;
}

function renderLegend(legend) {
  if (!legend?.items.length) return '';
  const title = legend.title ? `<span class="vm-chart-legend-title">${escapeHtml(legend.title)}</span>` : '';
  const items = legend.items.map(item => `<span class="vm-chart-legend-item"><span class="vm-chart-legend-dot" data-color="${item.color}" style="background:${item.color}"></span>${escapeHtml(item.label)}</span>`);
  return `<div class="vm-chart-legend">${title}${items.join('')}</div>`;
}

export function renderChart(fields, data, lang) {
  const foot = [
    `<div class="vm-chart-foot"><div class="vm-chart-basis">${escapeHtml(t(lang, 'chartBasis'))}: ${inline(fields.basis)}</div>`,
    fields.source ? `<div class="vm-chart-source">${escapeHtml(t(lang, 'chartSource'))}: ${inline(fields.source)}</div>` : '',
    '</div></div>',
  ].join('');
  const head = `<div class="vm-chart vm-chart-${fields.type}"><div class="vm-chart-says">${inline(fields.says)}</div>`;
  if (fields.type === 'kpi') return [`${head}${renderKpis(data.rows)}${foot}`, ''];
  return [`${head}${renderLegend(chartLegend(fields, data, lang))}`, '', '```vega-lite', JSON.stringify(chartSpec(fields, data, lang)), '```', '', foot, ''];
}

export function transformChart(lines, start, end, lang) {
  const { fields, errors } = parseChart(lines.slice(start + 1, end).join('\n'), start + 2, lang);
  if (errors.length) return { errors };
  const data = chartData(fields, tableAbove(lines, start), start + 2, lang);
  if (data.errors.length) return { errors: data.errors };
  return { output: renderChart(fields, data, lang) };
}
