import { escapeHtml, inline } from '../html.js';
import { t } from '../labels.js';
import { BADGE_COLORS } from '../badges.js';
import { parseNumber } from '../chart/table.js';
import { formatNumber } from '../chart/format.js';
import { readBlock, renderFoot, renderSays } from './common.js';

export const SCALE_FIELDS = ['says', 'unit', 'marker', 'basis', 'source'];
// "- 0–40: Kritisch | bad". The dash between the bounds may be –, —, -, .., "bis" or "to".
const RANGE = /^-\s+(-?[\d.,]+\s*%?)\s*(?:–|—|-|\.\.|bis|to)\s*(-?[\d.,]+\s*%?)\s*:\s*(.+)$/i;

export function parseScale(body, firstLine, lang) {
  const { fields, items, errors } = readBlock(body, firstLine, SCALE_FIELDS, lang);
  const markers = [];
  const ranges = [];
  // marker may repeat, so readBlock keeps only the last one: collect all of them from the raw lines.
  body.split(/\r?\n/).forEach((text, index) => {
    const match = /^marker:\s*(.+?)\s*$/i.exec(text);
    if (!match) return;
    const [raw, label = ''] = match[1].split('|').map(part => part.trim());
    const value = parseNumber(raw, lang);
    if (!Number.isFinite(value)) errors.push({ line: firstLine + index, message: t(lang, 'errNumber', { value: raw, column: 'marker' }) });
    else markers.push({ value, label, line: firstLine + index });
  });
  for (const { text, line } of items) {
    const match = RANGE.exec(text.trim());
    if (!match) { errors.push({ line, message: t(lang, 'errScaleLine') }); continue; }
    const [name, color = 'muted'] = match[3].split('|').map(part => part.trim());
    const from = parseNumber(match[1], lang);
    const to = parseNumber(match[2], lang);
    if (!BADGE_COLORS.includes(color)) errors.push({ line, message: t(lang, 'errValue', { field: 'color', value: color, list: BADGE_COLORS.join(', ') }) });
    else if (!(from < to)) errors.push({ line, message: t(lang, 'errScaleBounds', { from: match[1], to: match[2] }) });
    else if (ranges.length && from !== ranges[ranges.length - 1].to) {
      errors.push({ line, message: t(lang, 'errScaleGap', { from: match[1], to: formatNumber(ranges[ranges.length - 1].to, lang) }) });
    } else ranges.push({ from, to, name, color, line });
  }
  if (!ranges.length && !errors.length) errors.push({ line: firstLine, message: t(lang, 'errScaleEmpty') });
  const min = ranges[0]?.from;
  const max = ranges[ranges.length - 1]?.to;
  for (const marker of markers) {
    if (ranges.length && (marker.value < min || marker.value > max)) {
      errors.push({ line: marker.line, message: t(lang, 'errScaleMarker', { value: formatNumber(marker.value, lang), min: formatNumber(min, lang), max: formatNumber(max, lang) }) });
    }
  }
  return { fields, ranges, markers, errors };
}

/** One band over the whole range, each part tinted by its color, the bounds below and markers above. */
export function renderScale({ fields, ranges, markers }, lang) {
  const min = ranges[0].from;
  const span = ranges[ranges.length - 1].to - min;
  const at = value => `${(((value - min) / span) * 100).toFixed(3)}%`;
  const unit = fields.unit ? ` ${escapeHtml(fields.unit)}` : '';
  const segments = ranges.map(range => `<div class="vm-scale-part vm-scale-${range.color}${(range.to - range.from) / span < 0.15 ? ' vm-scale-narrow' : ''}" style="flex: ${range.to - range.from} 1 0" title="${escapeHtml(`${formatNumber(range.from, lang)}–${formatNumber(range.to, lang)}${fields.unit ? ` ${fields.unit}` : ''}: ${range.name}`)}"><span>${inline(range.name)}</span></div>`);
  const bounds = [min, ...ranges.map(range => range.to)];
  const ticks = bounds.map((value, index) => {
    const edge = index === 0 ? ' vm-scale-tick-start' : index === bounds.length - 1 ? ' vm-scale-tick-end' : '';
    return `<span class="vm-scale-tick${edge}" style="left: ${at(value)}">${escapeHtml(formatNumber(value, lang))}${index === bounds.length - 1 ? unit : ''}</span>`;
  });
  // A marker whose label would touch the previous one moves its label one row up. Estimated on a 600 px
  // band with 7 px per character, so it holds in the PDF too, where the band is narrowest.
  const text = marker => `${formatNumber(marker.value, lang)}${marker.label ? ` · ${marker.label}` : ''}`;
  let previous = null;
  const rows = [...markers].sort((a, b) => a.value - b.value).map(marker => {
    const close = Boolean(previous && !previous.close
      && ((marker.value - previous.value) / span) * 600 < ((text(previous).length + text(marker).length) / 2) * 7 + 12);
    previous = { ...marker, close };
    return previous;
  });
  const marks = rows.map(marker => `<div class="vm-scale-marker${marker.close ? ' vm-scale-marker-up' : ''}" style="left: ${at(marker.value)}"><span class="vm-scale-marker-label">${escapeHtml(formatNumber(marker.value, lang))}${marker.label ? ` · ${inline(marker.label)}` : ''}</span></div>`);
  return [
    `<div class="vm-scale${markers.length ? ' vm-scale-has-markers' : ''}${rows.some(marker => marker.close) ? ' vm-scale-two-rows' : ''}">`,
    renderSays(fields.says, 'vm-chart-says'),
    `<div class="vm-scale-track">${marks.join('')}<div class="vm-scale-parts">${segments.join('')}</div></div>`,
    `<div class="vm-scale-ticks">${ticks.join('')}</div>`,
    renderFoot(fields, lang),
    '</div>',
  ].join('');
}

export function transformScale(lines, start, end, lang) {
  const scale = parseScale(lines.slice(start + 1, end).join('\n'), start + 2, lang);
  return scale.errors.length ? { errors: scale.errors } : { output: [renderScale(scale, lang), ''] };
}
