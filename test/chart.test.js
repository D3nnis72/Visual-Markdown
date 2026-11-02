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
  assert.match(result, /<div class="vm-chart vm-chart-bar"><div class="vm-chart-says">A trägt den größten Teil.<\/div>\n\n```vega-lite\n/);
  assert.match(result, /<div class="vm-chart-foot"><div class="vm-chart-basis">Grundlage: Rechnungen 2025<\/div><\/div><\/div>/);
  assert.match(run(table + chart(base + '\nsource: [Auswertung](auswertung.md)')), /Grundlage: Rechnungen 2025<\/div><div class="vm-chart-source">Quelle: <a href="auswertung.md">Auswertung<\/a><\/div><\/div><\/div>/);
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

const areas = '| Bereich | Spend | Typ A | Typ B |\n| --- | ---: | ---: | ---: |\n| Nord | 400 | 300 | 100 |\n| Süd | 300 | 50 | 250 |\n| West | 200 | 120 | 80 |\n| Ost | 100 | 60 | 40 |\n| **Gesamt** | **1.000** | 530 | 470 |\n';
const typed = (type, extra = '') => spec(areas + chart(`type: ${type}\nx: Bereich\ny: Spend\nsays: s\nbasis: b${extra}`));
test('skips total rows except in a waterfall and folds a long share into other', () => {
  assert.deepEqual(typed('bar').data.values.map(row => row.x), ['Nord', 'Süd', 'West', 'Ost']);
  const share = typed('share');
  assert.deepEqual(share.data.values.map(row => [row.x, row.label]), [['Nord', '40 %'], ['Süd', '30 %'], ['West', '20 %'], ['Ost', '10 %']]);
  assert.equal(share.data.values[3].end, 1);
  const many = '| T | V |\n| --- | --- |\n' + [9, 8, 7, 6, 5, 4, 3].map((v, i) => `| t${i} | ${v} |`).join('\n') + '\n';
  const folded = spec(many + chart('type: share\nx: T\ny: V\nsays: s\nbasis: b')).data.values;
  assert.deepEqual(folded.map(row => row.x), ['t0', 't1', 't2', 't3', 't4', 'Sonstige']);
});
test('draws a waterfall with running totals on total rows', () => {
  const bridge = '| Schritt | Betrag |\n| --- | ---: |\n| Gelieferte Daten | 1.000 |\n| Ohne Betrag | -150 |\n| Dubletten | -50 |\n| Nachlieferung | 30 |\n| Gesamt | |\n';
  const values = spec(bridge + chart('type: waterfall\nx: Schritt\ny: Betrag\nsays: s\nbasis: b')).data.values;
  assert.deepEqual(values.map(v => [v.start, v.end, v.label]), [[0, 1000, '1.000'], [1000, 850, '−150'], [850, 800, '−50'], [800, 830, '+30'], [0, 830, '830']]);
});
test('groups bars, shades a heatmap and sorts a pareto with its running share', () => {
  const grouped = spec(areas + chart('type: bar\nx: Bereich\ny: Typ A, Typ B\ngrouped: yes\nsays: s\nbasis: b'));
  assert.equal(grouped.encoding.xOffset.field, 'series');
  assert.equal(grouped.encoding.y.stack, undefined);
  const heat = spec(areas + chart('type: heatmap\nx: Bereich\ny: Typ A, Typ B\nsays: s\nbasis: b'));
  assert.deepEqual(heat.data.values[0], { x: 'Nord', series: 'Typ A', y: 300, label: '300' });
  const pareto = typed('pareto').data.values;
  assert.deepEqual(pareto.map(v => [v.x, v.cumulative]), [['Nord', 0.4], ['Süd', 0.7], ['West', 0.9], ['Ost', 1]]);
});
test('plots scatter points with labels and progress against a target', () => {
  const points = '| Preis | Menge | Lieferant |\n| --- | --- | --- |\n| 10 | 200 | A |\n| 12,5 | 150 | B |\n';
  const scatter = spec(points + chart('type: scatter\nx: Preis\ny: Menge\nlabel: Lieferant\nsays: s\nbasis: b'));
  assert.deepEqual(scatter.data.values, [{ x: 10, y: 200, label: 'A' }, { x: 12.5, y: 150, label: 'B' }]);
  const goals = '| Schritt | Erledigt | Ziel |\n| --- | --- | --- |\n| Anreichern | 6.200 | 8.000 |\n';
  assert.equal(spec(goals + chart('type: progress\nx: Schritt\ny: Erledigt\ntarget: Ziel\nsays: s\nbasis: b')).data.values[0].label, '78 % · 6.200 / 8.000');
  assert.match(run(goals + chart('type: progress\nx: Schritt\ny: Erledigt\nsays: s\nbasis: b')), /Pflichtfeld „target“ fehlt/);
});
test('renders key figures as tiles with the raw table text', () => {
  const figures = '| Kennzahl | Wert | Hinweis |\n| --- | --- | --- |\n| Spend | **2,23 Mrd. €** | alle Zeilen |\n| Datensätze | 1.720.011 | |\n';
  const result = run(figures + chart('type: kpi\nx: Kennzahl\ny: Wert\nnote: Hinweis\nsays: Der Stand in Zahlen.\nbasis: Export'));
  assert.match(result, /<div class="vm-kpis"><div class="vm-kpi"><div class="vm-kpi-label">Spend<\/div><div class="vm-kpi-value">2,23 Mrd. €<\/div><div class="vm-kpi-note">alle Zeilen<\/div><\/div><div class="vm-kpi"><div class="vm-kpi-label">Datensätze<\/div><div class="vm-kpi-value">1.720.011<\/div><\/div><\/div>/);
  assert.doesNotMatch(result, /vega-lite/);
});
