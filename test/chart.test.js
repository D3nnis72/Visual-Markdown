import test from 'node:test';
import assert from 'node:assert/strict';
import { transform } from '../src/core.js';
import { parseNumber } from '../src/chart/table.js';
const today = new Date('2026-11-01T12:00:00');
const run = markdown => transform(markdown, { today });
const table = '| Lieferant | Spend | Quelle |\n| --- | ---: | --- |\n| A | 1.200 | SAP |\n| B | 450,5 | SAP |\n| C | 80 | Altsystem |\n';
const chart = body => '```chart\n' + body + '\n```\n';
const base = 'type: bar\nx: Lieferant\ny: Spend\nsays: A trägt den größten Teil.\nbasis: Rechnungen 2025';
const spec = markdown => JSON.parse(/```vega-lite\n(.*)\n```/.exec(run(markdown))[1]);

test('reads German, English and decorated numbers', () => {
  assert.equal(parseNumber('1.234,5', 'de'), 1234.5);
  assert.equal(parseNumber('12,5 %', 'de'), 12.5);
  assert.equal(parseNumber('€ 1.200', 'de'), 1200);
  assert.equal(parseNumber('1,234.5', 'en'), 1234.5);
  assert.equal(parseNumber('1.5', 'en'), 1.5);
  assert.equal(parseNumber('–', 'de'), null);
  assert.ok(Number.isNaN(parseNumber('viel', 'de')));
});
test('turns a chart under a table into a vega-lite block with statement and basis', () => {
  const result = run(table + '\n' + chart(base));
  assert.match(result, /<div class="vm-chart"><div class="vm-chart-says">A trägt den größten Teil.<\/div>\n\n```vega-lite\n/);
  assert.match(result, /<div class="vm-chart-basis">Grundlage: Rechnungen 2025<\/div><\/div>/);
  assert.doesNotMatch(result, /```chart/);
  const s = spec(table + '\n' + chart(base));
  assert.deepEqual(s.layer[0].mark, { type: 'bar', cornerRadiusEnd: 4 });
  assert.deepEqual(s.data.values, [{ x: 'A', y: 1200 }, { x: 'B', y: 450.5 }, { x: 'C', y: 80 }]);
  assert.deepEqual(s.layer[0].encoding.x.sort, ['A', 'B', 'C']);
  assert.equal(s.config.locale.number.decimal, ',');
});
test('stacks bars by the color column and normalizes with percent', () => {
  const s = spec(table + chart(base + '\ncolor: Quelle\npercent: yes'));
  assert.equal(s.encoding.y.stack, 'normalize');
  assert.equal(s.encoding.color.field, 'series');
  assert.deepEqual(s.data.values.map(row => row.series), ['SAP', 'SAP', 'Altsystem']);
});
test('folds several y columns into series and draws lines over ordered weeks', () => {
  const weeks = '| Woche | Offen | Fertig |\n| --- | --- | --- |\n| KW 40 | 10 | 2 |\n| KW 41 | 7 | 6 |\n';
  const s = spec(weeks + chart('type: line\nx: Woche\ny: Offen, Fertig\nsays: Offen sinkt.\nbasis: Ticketliste'));
  assert.equal(s.mark.type, 'line');
  assert.equal(s.encoding.x.type, 'ordinal');
  assert.deepEqual(s.data.values[1], { x: 'KW 40', y: 2, series: 'Fertig' });
  assert.equal(spec('| Tag | Wert |\n| --- | --- |\n| 2026-10-01 | 3 |\n' + chart('type: line\nx: Tag\ny: Wert\nsays: s\nbasis: b')).encoding.x.type, 'temporal');
});
test('lays long category labels out horizontally and keeps histogram bins tight', () => {
  const long = '| Lieferant | Spend |\n| --- | --- |\n| Ein sehr langer Lieferantenname | 3 |\n';
  assert.equal(spec(long + chart(base)).layer[0].encoding.y.field, 'x');
  assert.equal(spec(table + chart(base + '\norientation: horizontal')).layer[0].encoding.y.field, 'x');
  assert.equal(spec(table + chart(base.replace('bar', 'histogram'))).layer[0].encoding.x.scale.paddingInner, 0.04);
});
test('shows an error box for missing fields, tables, columns and numbers', () => {
  assert.match(run(chart(base)), /<div class="vm-error">Fehler in chart, Zeile 1: keine Tabelle direkt über dem Block<\/div>/);
  assert.match(run(table + chart('type: bar\nx: Lieferant\ny: Spend')), /Pflichtfeld „says“ fehlt/);
  assert.match(run(table + chart(base.replace('y: Spend', 'y: Menge'))), /Spalte „Menge“ gibt es in der Tabelle nicht/);
  assert.match(run(table + chart(base.replace('bar', 'pie'))), /„pie“ geht nicht für type, erlaubt sind bar, line, histogram/);
  assert.match(run(table + chart(base + '\nfarbe: rot')), /unbekanntes Feld „farbe“/);
  assert.match(run(table.replace('80', 'viel') + chart(base)), /Fehler in chart, Zeile 5: „viel“ in Spend ist keine Zahl/);
});
test('keeps chart blocks inside longer fences as code', () => {
  const md = '````markdown\n' + table + chart(base) + '````\n';
  assert.equal(run(md), md);
});
