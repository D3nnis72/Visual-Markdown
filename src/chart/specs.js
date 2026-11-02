import { t } from '../labels.js';
import { PALETTE, RAMP, NEUTRAL, TRACK, SHARE_MAX_PARTS } from './schema.js';
import { parseNumber } from './table.js';
import { formatNumber, formatPercent, formatSigned } from './format.js';

const FONT = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
// Total width of every chart, axes and legend included. CSS scales the SVG to the card, so all charts fill it alike.
const WIDTH = 760;
const MUTED = '#6b6b74';
const INK = '#52514e';
const DARK_INK = '#0b0b0b';
const ISO_DATE = /^\d{4}-\d{2}(-\d{2})?$/;
const LOCALES = {
  de: { decimal: ',', thousands: '.', grouping: [3], currency: ['', ' €'], percent: ' %' },
  en: { decimal: '.', thousands: ',', grouping: [3], currency: ['$', ''] },
};
const unique = values => [...new Set(values)];
// Category labels under bars: wrapped onto up to two lines when they are too wide for their band (about 6.5 px
// per character), tilted only when a single word is still too long. Tilting wastes height, Vega overestimates it.
function categoryAxis(names) {
  const room = Math.floor((WIDTH * 0.85) / Math.max(names.length, 1) / 6.5);
  const wrapped = {};
  for (const name of names.map(String)) {
    if (name.length <= room) continue;
    const lines = [];
    for (const word of name.split(/\s+/)) {
      const last = lines.length - 1;
      if (last >= 0 && `${lines[last]} ${word}`.length <= room) lines[last] += ` ${word}`;
      else lines.push(word);
    }
    if (lines.length > 2 || lines.some(line => line.length > room)) return { labelAngle: -30 };
    wrapped[name] = lines;
  }
  if (!Object.keys(wrapped).length) return { labelAngle: 0 };
  return { labelAngle: 0, labelExpr: `${JSON.stringify(wrapped)}[datum.label] || datum.label`, labelLineHeight: 14 };
}
// Labels inside a colored fill are white, except on the light yellow slot.
const inkOn = color => (color === PALETTE[3] ? DARK_INK : '#ffffff');

function base(fields, values, lang) {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: fields.says,
    background: 'transparent',
    autosize: { type: 'fit-x', contains: 'padding' },
    data: { values },
    config: {
      font: FONT,
      locale: { number: LOCALES[lang] },
      view: { stroke: null },
      range: { category: PALETTE },
      axis: {
        labelFontSize: 12, titleFontSize: 12, titleFontWeight: 500, titlePadding: 10,
        labelColor: MUTED, titleColor: MUTED, gridColor: '#ededf0', domain: false, ticks: false, labelPadding: 6, labelLimit: 320,
      },
      axisX: { grid: false },
      // The legend is HTML above the chart (chartLegend), so it can be centered whatever Vega measures.
      legend: { disable: true },
      mark: { color: PALETTE[0] },
      text: { fontSize: 12, color: INK },
    },
  };
}

const seriesOrder = rows => unique(rows.map(row => row.series));
const colorBy = (data, rows) => ({ field: 'series', type: 'nominal', title: data.seriesTitle, sort: seriesOrder(rows) });

function barSpec(fields, data, lang) {
  const series = data.rows.some(row => row.series !== null);
  const values = data.rows.map(row => ({ x: row.x, y: row.y, ...(series ? { series: row.series } : {}) }));
  const percent = fields.percent === 'yes';
  const grouped = series && fields.grouped === 'yes';
  const order = unique(values.map(row => row.x));
  const horizontal = fields.type === 'bar'
    && (fields.orientation ? fields.orientation === 'horizontal' : order.some(x => String(x).length > 12) || order.length > 8);
  const histogram = fields.type === 'histogram';
  const category = {
    field: 'x', type: 'ordinal', sort: order, title: horizontal ? null : data.xTitle,
    scale: { paddingInner: histogram ? 0.04 : grouped ? 0.2 : 0.25, paddingOuter: histogram ? 0 : 0.15 },
    ...(horizontal ? {} : { axis: { labelAngle: 0 } }),
  };
  const measure = {
    field: 'y', type: 'quantitative', title: percent ? null : data.yTitle,
    ...(series && !grouped ? { stack: percent ? 'normalize' : 'zero' } : {}),
    ...(percent ? { axis: { format: '%' } } : {}),
  };
  const offset = grouped ? { [horizontal ? 'yOffset' : 'xOffset']: { field: 'series', sort: seriesOrder(data.rows), scale: { paddingInner: 0.08 } } } : {};
  const encoding = {
    [horizontal ? 'y' : 'x']: category, [horizontal ? 'x' : 'y']: measure,
    ...(series ? { color: colorBy(data, data.rows) } : {}), ...offset,
  };
  const size = horizontal
    ? { width: WIDTH, height: { step: grouped ? 18 * seriesOrder(data.rows).length + 10 : 28 } }
    : { width: WIDTH, height: 260 };
  const bar = { type: 'bar', ...(series && !grouped ? { cornerRadius: 2, stroke: '#ffffff', strokeWidth: 1.5 } : { cornerRadiusEnd: 4 }) };
  if (series) return { ...base(fields, values, lang), ...size, mark: bar, encoding };
  // A single series gets its values at the bar ends, so nobody has to read the axis.
  const label = {
    mark: { type: 'text', ...(horizontal ? { align: 'left', dx: 6 } : { baseline: 'bottom', dy: -4 }) },
    encoding: { x: encoding.x, y: encoding.y, text: { field: 'y', type: 'quantitative', format: ',~r' } },
  };
  return { ...base(fields, values, lang), ...size, layer: [{ mark: bar, encoding }, ...(order.length <= 16 ? [label] : [])] };
}

function lineSpec(fields, data, lang) {
  const series = data.rows.some(row => row.series !== null);
  const xs = data.rows.map(row => row.x);
  const temporal = xs.every(value => ISO_DATE.test(value));
  const numeric = !temporal && xs.every(value => Number.isFinite(parseNumber(value, lang)));
  const values = data.rows.map(row => ({ x: numeric ? parseNumber(row.x, lang) : row.x, y: row.y, ...(series ? { series: row.series } : {}) }));
  const x = { field: 'x', type: temporal ? 'temporal' : numeric ? 'quantitative' : 'ordinal', title: data.xTitle, axis: { labelAngle: 0 }, ...(temporal || numeric ? {} : { sort: unique(xs) }) };
  return {
    ...base(fields, values, lang), width: WIDTH, height: 260,
    mark: { type: 'line', strokeWidth: 2, point: { filled: true, size: 50 } },
    encoding: { x, y: { field: 'y', type: 'quantitative', title: data.yTitle }, ...(series ? { color: colorBy(data, data.rows) } : {}) },
  };
}

/** One whole split into parts: a tall segmented bar with the share printed on each part. */
function shareParts(data, lang) {
  let parts = data.rows.map(row => ({ x: row.x, y: row.y }));
  if (parts.length > SHARE_MAX_PARTS) {
    const kept = [...parts].sort((a, b) => b.y - a.y).slice(0, SHARE_MAX_PARTS - 1);
    const rest = parts.filter(part => !kept.includes(part)).reduce((sum, part) => sum + part.y, 0);
    parts = [...parts.filter(part => kept.includes(part)), { x: t(lang, 'chartOther'), y: rest }];
  }
  return parts;
}

function shareSpec(fields, data, lang) {
  const parts = shareParts(data, lang);
  const total = parts.reduce((sum, part) => sum + part.y, 0) || 1;
  let start = 0;
  const values = parts.map((part, index) => {
    const share = part.y / total;
    const value = { x: part.x, start, end: start + share, label: share >= 0.07 ? formatPercent(share, lang, share < 0.1 ? 1 : 0) : '', ink: inkOn(PALETTE[index % PALETTE.length]) };
    start += share;
    return value;
  });
  if (values.length) values[values.length - 1].end = 1;
  const order = values.map(value => value.x);
  const scaleX = { domain: [0, 1] };
  return {
    ...base(fields, values, lang), width: WIDTH, height: 28,
    // No side padding: the bar lines up with the heading and the foot text.
    padding: { left: 0, right: 0, top: 5, bottom: 5 },
    encoding: { y: { value: 14 } },
    layer: [
      {
        mark: { type: 'bar', height: 28, cornerRadius: 4, stroke: '#ffffff', strokeWidth: 2 },
        encoding: {
          x: { field: 'start', type: 'quantitative', scale: scaleX, axis: null }, x2: { field: 'end' },
          color: { field: 'x', type: 'nominal', sort: order, title: null },
        },
      },
      {
        mark: { type: 'text', align: 'left', dx: 8, fontWeight: 600 },
        encoding: { x: { field: 'start', type: 'quantitative', scale: scaleX, axis: null }, text: { field: 'label' }, color: { field: 'ink', type: 'nominal', scale: null } },
      },
    ],
  };
}

/** Rows by columns, each cell shaded by its value and labeled with it. */
function heatmapSpec(fields, data, lang) {
  const values = data.rows.map(row => ({ x: row.x, series: row.series, y: row.y, label: formatNumber(row.y, lang) }));
  const max = Math.max(...values.map(value => value.y), 0);
  const columns = seriesOrder(data.rows);
  return {
    ...base(fields, values, lang),
    width: WIDTH, height: { step: 36 },
    encoding: {
      x: { field: 'series', type: 'ordinal', sort: columns, title: null, axis: { orient: 'top', labelAngle: 0 } },
      y: { field: 'x', type: 'ordinal', sort: unique(data.rows.map(row => row.x)), title: null },
    },
    layer: [
      {
        mark: { type: 'rect', cornerRadius: 4, stroke: '#ffffff', strokeWidth: 2 },
        encoding: { color: { field: 'y', type: 'quantitative', scale: { range: RAMP, domain: [0, max || 1] }, legend: null } },
      },
      {
        mark: { type: 'text', fontWeight: 500 },
        encoding: {
          text: { field: 'label' },
          color: { condition: { test: `datum.y > ${max * 0.55}`, value: '#ffffff' }, value: DARK_INK },
        },
      },
    ],
  };
}

/** A bridge from a starting value through changes; rows named like a total show the running total. */
function waterfallSpec(fields, data, lang) {
  let running = 0;
  const values = data.rows.map((row, index) => {
    if (index === 0 || row.total || row.y === null) {
      if (index === 0) running = row.y ?? 0;
      return { x: row.x, start: 0, end: running, kind: 'total', label: formatNumber(running, lang) };
    }
    const start = running;
    running += row.y;
    return { x: row.x, start, end: running, kind: row.y >= 0 ? 'up' : 'down', label: formatSigned(row.y, lang) };
  });
  const order = values.map(value => value.x);
  const x = { field: 'x', type: 'ordinal', sort: order, title: null, axis: categoryAxis(order), scale: { paddingInner: 0.3 } };
  const kinds = [t(lang, 'chartTotal'), t(lang, 'chartUp'), t(lang, 'chartDown')];
  const named = values.map(value => ({ ...value, kind: kinds[['total', 'up', 'down'].indexOf(value.kind)] }));
  return {
    ...base(fields, named, lang), width: WIDTH, height: 260,
    encoding: { x },
    layer: [
      {
        mark: { type: 'bar', cornerRadius: 3 },
        encoding: {
          y: { field: 'start', type: 'quantitative', title: data.yTitle }, y2: { field: 'end' },
          color: { field: 'kind', type: 'nominal', scale: { domain: kinds, range: [WATERFALL_COLORS.total, WATERFALL_COLORS.up, WATERFALL_COLORS.down] }, title: null },
        },
      },
      {
        mark: { type: 'text', baseline: 'bottom', dy: -4 },
        encoding: { y: { field: 'top', type: 'quantitative' }, text: { field: 'label' } },
        transform: [{ calculate: 'max(datum.start, datum.end)', as: 'top' }],
      },
    ],
  };
}

/** Parts sorted largest first with the running share, both on one percent axis. */
function paretoSpec(fields, data, lang) {
  const sorted = [...data.rows].sort((a, b) => b.y - a.y);
  const total = sorted.reduce((sum, row) => sum + row.y, 0) || 1;
  let cumulative = 0;
  const values = sorted.map(row => {
    cumulative += row.y;
    return { x: row.x, share: row.y / total, cumulative: cumulative / total, label: formatPercent(row.y / total, lang, 0) };
  });
  const names = [t(lang, 'chartShare'), t(lang, 'chartCumulative')];
  const x = { field: 'x', type: 'ordinal', sort: values.map(value => value.x), title: data.xTitle, axis: categoryAxis(values.map(value => value.x)), scale: { paddingInner: 0.25 } };
  const y = field => ({ field, type: 'quantitative', title: null, scale: { domain: [0, 1] }, axis: { format: '%' } });
  return {
    ...base(fields, values, lang), width: WIDTH, height: 260,
    encoding: { x },
    layer: [
      { mark: { type: 'bar', cornerRadiusEnd: 4 }, encoding: { y: y('share'), color: { datum: names[0], scale: { domain: names, range: [PALETTE[0], PALETTE[1]] }, title: null } } },
      ...(values.length <= 12 ? [{ mark: { type: 'text', baseline: 'bottom', dy: -4 }, encoding: { y: y('share'), text: { field: 'label' } } }] : []),
      { mark: { type: 'line', strokeWidth: 2, point: { filled: true, size: 50 } }, encoding: { y: y('cumulative'), color: { datum: names[1] } } },
      { data: { values: [{}] }, mark: { type: 'rule', strokeDash: [4, 4], color: MUTED }, encoding: { x: { value: 0 }, x2: { value: 'width' }, y: y('mark'), text: null }, transform: [{ calculate: '0.8', as: 'mark' }] },
    ],
  };
}

function scatterSpec(fields, data, lang) {
  const series = data.rows.some(row => row.series !== null);
  const values = data.rows.map(row => ({ x: row.xNumber, y: row.y, ...(series ? { series: row.series } : {}), ...(row.label ? { label: row.label } : {}) }));
  const encoding = {
    x: { field: 'x', type: 'quantitative', title: data.xTitle, scale: { zero: false, nice: true }, axis: { grid: true } },
    y: { field: 'y', type: 'quantitative', title: data.yTitle, scale: { zero: false, nice: true } },
  };
  const labels = values.some(value => value.label) && values.length <= 20;
  return {
    ...base(fields, values, lang), width: WIDTH, height: 300, encoding,
    layer: [
      { mark: { type: 'point', filled: true, size: 70, opacity: 1, stroke: '#ffffff', strokeWidth: 1.5 }, encoding: series ? { color: colorBy(data, data.rows) } : {} },
      ...(labels ? [{ mark: { type: 'text', align: 'left', dx: 8 }, encoding: { text: { field: 'label' } } }] : []),
    ],
  };
}

/** Each row against its target: a filled bar on a lighter track of the same hue, the numbers above its end. */
function progressSpec(fields, data, lang) {
  const values = data.rows.map(row => {
    const share = row.target ? row.y / row.target : 0;
    return { x: row.x, share: Math.min(share, 1), label: `${formatPercent(share, lang, 0)} · ${formatNumber(row.y, lang)} / ${formatNumber(row.target, lang)}` };
  });
  const y = { field: 'x', type: 'ordinal', sort: values.map(value => value.x), title: null };
  const x = field => ({ field, type: 'quantitative', scale: { domain: [0, 1] }, axis: null });
  return {
    ...base(fields, values, lang), width: WIDTH, height: { step: 40 },
    encoding: { y },
    layer: [
      { mark: { type: 'bar', height: 10, cornerRadius: 5, color: TRACK }, encoding: { x: { datum: 1, type: 'quantitative', scale: { domain: [0, 1] }, axis: null } } },
      { mark: { type: 'bar', height: 10, cornerRadius: 5, color: PALETTE[0] }, encoding: { x: x('share') } },
      { mark: { type: 'text', align: 'right', baseline: 'bottom', dy: -9 }, encoding: { x: { datum: 1, type: 'quantitative', scale: { domain: [0, 1] }, axis: null }, text: { field: 'label' } } },
    ],
  };
}

const BUILDERS = {
  bar: barSpec, histogram: barSpec, line: lineSpec, share: shareSpec, heatmap: heatmapSpec,
  waterfall: waterfallSpec, pareto: paretoSpec, scatter: scatterSpec, progress: progressSpec,
};

const WATERFALL_COLORS = { total: NEUTRAL, up: PALETTE[0], down: PALETTE[7] };

/** Color keys for the HTML legend: `{ title, items: [{ label, color }] }`, or null when color carries no meaning. */
export function chartLegend(fields, data, lang) {
  const palette = labels => labels.map((label, index) => ({ label, color: PALETTE[index % PALETTE.length] }));
  switch (fields.type) {
    case 'share': return { title: null, items: palette(shareParts(data, lang).map(part => part.x)) };
    case 'pareto': return { title: null, items: palette([t(lang, 'chartShare'), t(lang, 'chartCumulative')]) };
    case 'waterfall': {
      const kinds = data.rows.map((row, index) => (index === 0 || row.total || row.y === null ? 'total' : row.y >= 0 ? 'up' : 'down'));
      const present = ['total', 'up', 'down'].filter(kind => kinds.includes(kind));
      const names = { total: t(lang, 'chartTotal'), up: t(lang, 'chartUp'), down: t(lang, 'chartDown') };
      return { title: null, items: present.map(kind => ({ label: names[kind], color: WATERFALL_COLORS[kind] })) };
    }
    case 'bar': case 'histogram': case 'line': case 'scatter': {
      if (!data.rows.some(row => row.series !== null)) return null;
      return { title: data.seriesTitle, items: palette(seriesOrder(data.rows)) };
    }
    default: return null;
  }
}

/** Builds the Vega-Lite spec MPE renders to SVG, in preview and in the PDF export. */
export const chartSpec = (fields, data, lang) => BUILDERS[fields.type](fields, data, lang);
