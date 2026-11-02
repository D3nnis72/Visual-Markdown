import { isTableRow, isTableSeparator } from '../badges.js';

const cells = line => line.trim().replace(/^\|/, '').replace(/(?<!\\)\|\s*$/, '')
  .split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g, '|').replace(/^(\*\*|\*|`)(.*)\1$/, '$2').trim());

/** Finds the Markdown table that ends directly above `start`, skipping blank lines. */
export function tableAbove(lines, start) {
  let end = start - 1;
  while (end >= 0 && !lines[end].trim()) end--;
  let first = end;
  while (first > 0 && isTableRow(lines[first - 1])) first--;
  if (end < 0 || !isTableRow(lines[end]) || end - first < 2 || !isTableSeparator(lines[first + 1])) return null;
  const header = cells(lines[first]);
  const rows = lines.slice(first + 2, end + 1).map((line, index) => ({ line: first + 3 + index, values: cells(line) }));
  return { header, rows };
}

/** Reads 1.234,5 and 1,234.5 as well as 12 %, € 1.200 and plain numbers. Empty or a dash is null. */
export function parseNumber(raw, lang) {
  let text = String(raw ?? '').replace(/[\s %€$]|EUR|USD/gi, '');
  if (!text || /^[-–—]$/.test(text)) return null;
  const german = /^[+-]?\d{1,3}(\.\d{3})+(,\d+)?$/;
  const english = /^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/;
  if (lang === 'en') {
    if (english.test(text)) text = text.replace(/,/g, '');
  } else if (german.test(text)) {
    text = text.replace(/\./g, '').replace(',', '.');
  } else if (/^[+-]?\d+,\d+$/.test(text)) {
    text = text.replace(',', '.');
  }
  return /^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(text) ? Number(text) : NaN;
}
