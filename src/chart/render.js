import { escapeHtml, inline } from '../html.js';
import { t } from '../labels.js';
import { CHART_TYPES, CHART_FIELDS, CHART_REQUIRED, CHART_VALUES, PALETTE } from './schema.js';
import { tableAbove, parseNumber } from './table.js';

const FONT = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
const WIDTH = 640;
const ISO_DATE = /^\d{4}-\d{2}(-\d{2})?$/;
const LOCALES = {
  de: { decimal: ',', thousands: '.', grouping: [3], currency: ['', ' €'] },
  en: { decimal: '.', thousands: ',', grouping: [3], currency: ['$', ''] },
};

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
  for (const [field, allowed] of Object.entries(CHART_VALUES)) {
    if (fields[field] && !allowed.includes(fields[field])) {
      errors.push({ line: firstLine, message: t(lang, 'errValue', { field, value: fields[field], list: allowed.join(', ') }) });
    }
  }
  return { fields, errors };
}

/** Turns the table above the block into long rows `{ x, y, series }`, or errors. */
export function chartData(fields, table, firstLine, lang) {
  if (!table) return { errors: [{ line: firstLine - 1, message: t(lang, 'errNoTable') }] };
  const errors = [];
  const column = name => {
    const index = table.header.findIndex(head => head.toLowerCase() === name.toLowerCase());
    if (index < 0) errors.push({ line: firstLine, message: t(lang, 'errColumn', { column: name }) });
    return index;
  };
  const yNames = fields.y.split(',').map(name => name.trim()).filter(Boolean);
  const x = column(fields.x);
  const ys = yNames.map(column);
  const color = fields.color ? column(fields.color) : -1;
  if (fields.color && yNames.length > 1) errors.push({ line: firstLine, message: t(lang, 'errColorMulti') });
  if (errors.length) return { errors };
  const rows = [];
  for (const row of table.rows) {
    ys.forEach((index, n) => {
      const value = parseNumber(row.values[index], lang);
      if (Number.isNaN(value)) {
        errors.push({ line: row.line, message: t(lang, 'errNumber', { value: row.values[index], column: table.header[index] }) });
      } else if (value !== null) {
        rows.push({ x: row.values[x] ?? '', y: value, series: color >= 0 ? row.values[color] ?? '' : yNames.length > 1 ? table.header[index] : null });
      }
    });
  }
  return {
    errors, rows,
    xTitle: table.header[x],
    yTitle: yNames.length > 1 ? null : table.header[ys[0]],
    seriesTitle: color >= 0 ? table.header[color] : null,
  };
}

function xScale(fields, rows, lang) {
  const xs = rows.map(row => row.x);
  if (fields.type === 'line' && xs.every(value => ISO_DATE.test(value))) return { type: 'temporal' };
  if (fields.type === 'line' && xs.every(value => Number.isFinite(parseNumber(value, lang)))) return { type: 'quantitative', numeric: true };
  return { type: 'ordinal', sort: null };
}

/** Builds the Vega-Lite spec MPE renders to SVG, in preview and in the PDF export. */
export function chartSpec(fields, data, lang) {
  const series = data.rows.some(row => row.series !== null);
  const scale = xScale(fields, data.rows, lang);
  const values = data.rows.map(row => ({
    x: scale.numeric ? parseNumber(row.x, lang) : row.x, y: row.y, ...(series ? { series: row.series } : {}),
  }));
  const percent = fields.percent === 'yes';
  const categories = new Set(values.map(row => row.x)).size;
  const longLabels = values.some(row => String(row.x).length > 12);
  const horizontal = fields.type === 'bar'
    && (fields.orientation ? fields.orientation === 'horizontal' : longLabels || categories > 8);
  const order = [...new Set(values.map(row => row.x))];
  const category = { field: 'x', type: scale.type, title: data.xTitle, ...(scale.sort === null ? { sort: order } : {}) };
  const measure = {
    field: 'y', type: 'quantitative', title: percent ? null : data.yTitle,
    ...(series && fields.type !== 'line' ? { stack: percent ? 'normalize' : 'zero' } : {}),
    ...(percent ? { axis: { format: '%' } } : {}),
  };
  const colorEncoding = series
    ? { color: { field: 'series', type: 'nominal', title: data.seriesTitle, sort: [...new Set(values.map(row => row.series))] } }
    : {};
  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: fields.says,
    background: 'transparent',
    data: { values },
    config: {
      font: FONT,
      locale: { number: LOCALES[lang] },
      view: { stroke: null },
      range: { category: PALETTE },
      axis: {
        labelFontSize: 12, titleFontSize: 12, titleFontWeight: 500, titlePadding: 10,
        labelColor: '#6b6b74', titleColor: '#6b6b74', gridColor: '#ededf0', domain: false, ticks: false, labelPadding: 6,
      },
      axisX: { grid: false },
      legend: { orient: 'top', labelFontSize: 12, titleFontSize: 12, titleFontWeight: 500, labelColor: '#6b6b74', titleColor: '#6b6b74', symbolType: 'circle', symbolSize: 90 },
      mark: { color: PALETTE[0] },
    },
  };
  if (fields.type === 'line') {
    return {
      ...spec, width: WIDTH, height: 260,
      mark: { type: 'line', strokeWidth: 2, point: { filled: true, size: 50 } },
      encoding: { x: { ...category, axis: { labelAngle: 0 } }, y: measure, ...colorEncoding },
    };
  }
  const histogram = fields.type === 'histogram';
  const bar = {
    type: 'bar',
    ...(series ? { cornerRadius: 2, stroke: '#ffffff', strokeWidth: 1.5 } : { cornerRadiusEnd: 4 }),
  };
  const band = { scale: { paddingInner: histogram ? 0.04 : 0.25, paddingOuter: histogram ? 0 : 0.15 } };
  const encoding = horizontal
    ? { y: { ...category, ...band, title: null }, x: { ...measure, title: percent ? null : data.yTitle }, ...colorEncoding }
    : { x: { ...category, ...band, axis: { labelAngle: 0 } }, y: measure, ...colorEncoding };
  const size = horizontal ? { width: WIDTH - 140, height: { step: 28 } } : { width: WIDTH, height: 260 };
  if (series) return { ...spec, ...size, mark: bar, encoding };
  // A single series gets its values at the bar ends, so nobody has to read the axis.
  const label = {
    mark: { type: 'text', fontSize: 12, color: '#52514e', ...(horizontal ? { align: 'left', dx: 6 } : { baseline: 'bottom', dy: -4 }) },
    encoding: { ...(horizontal ? { y: encoding.y, x: encoding.x } : { x: encoding.x, y: encoding.y }), text: { field: 'y', type: 'quantitative', format: ',~r' } },
  };
  return { ...spec, ...size, layer: [{ mark: bar, encoding }, ...(categories <= 16 ? [label] : [])] };
}

export function renderChart(fields, spec, lang) {
  return [
    `<div class="vm-chart"><div class="vm-chart-says">${inline(fields.says)}</div>`,
    '',
    '```vega-lite',
    JSON.stringify(spec),
    '```',
    '',
    `<div class="vm-chart-basis">${escapeHtml(t(lang, 'chartBasis'))}: ${inline(fields.basis)}</div></div>`,
    '',
  ];
}

export function transformChart(lines, start, end, lang) {
  const { fields, errors } = parseChart(lines.slice(start + 1, end).join('\n'), start + 2, lang);
  if (errors.length) return { errors };
  const data = chartData(fields, tableAbove(lines, start), start + 2, lang);
  if (data.errors.length) return { errors: data.errors };
  return { output: renderChart(fields, chartSpec(fields, data, lang), lang) };
}
