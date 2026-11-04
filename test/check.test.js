import test from 'node:test';
import assert from 'node:assert/strict';
import { checkMarkdown } from '../src/check.js';
const today = new Date('2026-11-10T12:00:00');
const check = (markdown, path = '/x/doc.md') => checkMarkdown(markdown, { path, today }).map(f => `${f.line} ${f.level} ${f.message}`);
const front = (extra = '') => `---\nvisual:\n  created: 2026-11-01\n  as-of: 2026-11-09\n${extra}---\n# T\n`;

test('a complete page has no findings', () => {
  const md = front() + '\n## Plan {#plan updated=2026-11-09}\n\n```steps\n- [x] a: A | updated: 2026-10-01\n- [ ] b: B | after: a | updated: 2026-11-09\n  Was passiert und warum.\n```\n';
  assert.deepEqual(check(md), []);
});
test('reports broken blocks as errors with the file line', () => {
  const md = front() + '\n```steps\n- [ ] a: A | after: zz | updated: 2026-11-09\n  B\n```\n\n```chart\ntype: bar\n```\n';
  const findings = check(md);
  assert.ok(findings.includes('9 error „zz“ in after gibt es nicht'), findings.join('\n'));
  assert.ok(findings.some(f => /^14 error Pflichtfeld „x“ fehlt/.test(f)), findings.join('\n'));
});
test('warns about missing and old dates, descriptions and an as-of behind the content', () => {
  const md = '---\nvisual:\n  as-of: 2026-10-01\n---\n# T\n\n## A {#a}\n\n```steps\n- [ ] a: A\n- [~] b: B | updated: 2026-10-02\n  B\n- [ ] c: C | updated: 2026-11-09\n  C\n```\n';
  assert.deepEqual(check(md), [
    '2 warning `created` fehlt unter `visual:`',
    '3 warning `as-of` ist älter als 7 Tage (1. Oktober 2026)',
    '3 warning `as-of` ist älter als das neueste `updated` (9. November 2026)',
    '7 warning Abschnitt `a` hat kein `updated=`',
    '10 warning Schritt `a` hat kein `updated`',
    '10 warning Schritt `a` hat keine Beschreibung in der Zeile darunter',
    '11 warning `b` ist älter als 7 Tage (2. Oktober 2026)',
  ]);
});
test('asks for share: intern under Customers and flags unknown words', () => {
  assert.deepEqual(check(front(), '/Users/d/Customers/Acme/status.md'), ['1 warning Datei liegt unter Customers/, aber `share: intern` fehlt']);
  assert.deepEqual(check(front('  share: intern\n'), '/Users/d/Customers/Acme/status.md'), []);
  assert.deepEqual(check(front('  share: geheim\n  badges: { offen: orange }\n') + '\n> [!card flag lila] X\n'), [
    '5 warning `share: geheim` kennt der Renderer nicht, gemeint ist wohl `intern`',
    '6 warning Badge-Farbe `orange` gibt es nicht, erlaubt sind ok, warn, bad, info, muted',
    '10 warning `lila` ist weder Icon noch Farbe einer Karte',
  ]);
});
test('ignores plain Markdown and blocks inside longer fences', () => {
  assert.deepEqual(check('# T\n\nText.\n'), []);
  assert.deepEqual(check('# T\n\n````markdown\n```steps\n- [ ] a: A | after: zz\n```\n````\n'), []);
});
test('asks for a source on every chart', () => {
  const table = '\n| Werk | Positionen |\n| --- | --- |\n| Nord | 3 |\n';
  const chart = extra => `\n\`\`\`chart\ntype: bar\nx: Werk\ny: Positionen\nsays: S\nbasis: B\n${extra}\`\`\`\n`;
  assert.deepEqual(check(front() + table + chart('')), ['12 warning Diagramm ohne `source`: Wo liegt die Auswertung?']);
  assert.deepEqual(check(front() + table + chart('source: Auswertung\n')), []);
});

test('flags a status line in the text when the band already shows the status', () => {
  assert.deepEqual(check(front('  status: Läuft\n') + '\n> **Status:** Läuft noch.\n'), ['9 warning Status steht schon im Band aus `visual.status`, die Zeile im Text doppelt ihn']);
  assert.deepEqual(check(front() + '\n> **Status:** Läuft noch.\n'), []);
});
