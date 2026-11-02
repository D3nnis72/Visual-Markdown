import test from 'node:test';
import assert from 'node:assert/strict';
import { transform } from '../src/core.js';
import { parseScale } from '../src/blocks/scale.js';
import { parseGallery } from '../src/blocks/gallery.js';
import { parseCompare } from '../src/blocks/compare.js';

const block = (kind, body) => `# T\n\n\`\`\`${kind}\n${body}\n\`\`\`\n`;
const messages = result => result.errors.map(error => `${error.line} ${error.message}`);

test('scale reads ranges, colors and repeated markers', () => {
  const scale = parseScale('unit: Punkte\n- 0–40: Kritisch | bad\n- 40 - 70: Gefährdet | warn\n- 70 bis 100: Gesund\nmarker: 82 | Kunde A\nmarker: 64', 2, 'de');
  assert.deepEqual(scale.errors, []);
  assert.deepEqual(scale.ranges.map(range => [range.from, range.to, range.name, range.color]), [[0, 40, 'Kritisch', 'bad'], [40, 70, 'Gefährdet', 'warn'], [70, 100, 'Gesund', 'muted']]);
  assert.deepEqual(scale.markers.map(marker => [marker.value, marker.label]), [[82, 'Kunde A'], [64, '']]);
  const html = transform(block('scale', 'unit: Punkte\n- 0–40: Kritisch | bad\n- 40–100: Gesund | ok\nmarker: 82 | Kunde A'));
  assert.match(html, /class="vm-scale-part vm-scale-bad" style="flex: 40 1 0"/);
  assert.match(html, /style="left: 82\.000%"><span class="vm-scale-marker-label">82 · Kunde A/);
  assert.match(html, />100 Punkte<\/span>/);
});

test('scale reports gaps, wrong colors and markers outside the range', () => {
  assert.deepEqual(messages(parseScale('- 0–40: A | bad\n- 50–100: B | gruen\nmarker: 120', 2, 'de')), [
    '3 „gruen“ geht nicht für color, erlaubt sind ok, warn, bad, info, muted',
    '4 Markierung 120 liegt außerhalb von 0 bis 40',
  ]);
  assert.deepEqual(messages(parseScale('- 0–40: A\n- 50–100: B', 2, 'de')), ['3 Bereich ab 50 schließt nicht an 40 an']);
  assert.deepEqual(messages(parseScale('Kritisch unter 40', 2, 'de')), ['2 Bereiche sehen so aus: „- 0–40: Kritisch | bad“']);
});

test('gallery keeps images as Markdown so MPE resolves the paths', () => {
  const html = transform(block('gallery', 'columns: 2\n![Hell](bilder/hell.png) Helles Theme\n![Dunkel](bilder/dunkel.png)'));
  assert.match(html, /--vm-gallery-columns: 2/);
  assert.match(html, /\n!\[Hell\]\(bilder\/hell\.png\)\n/);
  assert.match(html, /<figcaption>Helles Theme<\/figcaption>/);
  assert.match(html, /<figcaption>Dunkel<\/figcaption>/);
  assert.deepEqual(messages(parseGallery('columns: 6\nbilder/hell.png', 2, 'de')), [
    '2 „6“ geht nicht für columns, erlaubt sind 1, 2, 3, 4',
    '3 Jede Zeile ist ein Bild: „![Text](pfad.png) Bildunterschrift“',
  ]);
});

test('compare reads options with text, pros, cons and one recommendation', () => {
  const compare = parseCompare('says: S\n- A | empfohlen\n  Text eins\n  + gut\n  - schlecht\n- B\n  + auch gut', 2, 'de');
  assert.deepEqual(compare.errors, []);
  assert.deepEqual(compare.options.map(option => [option.title, option.recommended, option.text, option.pros, option.cons]), [
    ['A', true, ['Text eins'], ['gut'], ['schlecht']], ['B', false, [], ['auch gut'], []],
  ]);
  const html = transform(block('compare', '- A | recommended\n  + gut\n- B\n  - schlecht'));
  assert.match(html, /vm-compare-option vm-compare-recommended/);
  assert.match(html, /Empfehlung/);
  assert.deepEqual(messages(parseCompare('- A\n+ gut', 2, 'de')), ['3 Unter „- Option“ stehen eingerückt „+ Vorteil“, „- Nachteil“ oder Text']);
  assert.deepEqual(messages(parseCompare('- A | empfohlen\n- B | empfohlen', 2, 'de')), ['3 Nur eine Option kann empfohlen sein']);
  assert.deepEqual(messages(parseCompare('- A', 2, 'de')), ['2 Zwei bis vier Optionen, gefunden: 1']);
});

test('a broken block shows the error box with its name', () => {
  assert.match(transform(block('scale', 'x')), /Fehler in scale, Zeile 4/);
});
