import test from 'node:test';
import assert from 'node:assert/strict';
import { transform } from '../src/core.js';
const today = new Date('2026-11-01T12:00:00');
const run = markdown => transform(markdown, { today });
const block = '- [ ] a: A';
const fence = body => '```steps\n' + body + '\n```\n';

test('leaves files without visual and steps unchanged', () => {
  const md = '---\nid: x\n---\n# T\n\nA paragraph.\n';
  assert.equal(run(md), md);
});
test('renders a top-level steps block', () => {
  const result = run(fence(block));
  assert.match(result, /class="vm-steps"/);
  assert.doesNotMatch(result, /```steps/);
});
test('keeps steps inside a longer fence as code', () => {
  const md = '````markdown\n' + fence(block) + '````\n';
  assert.equal(run(md), md);
});
test('shows an error box with the file line', () => {
  const result = run('---\nid: x\n---\n# T\n\n```steps\n- [ ] a: A\n- [ ] b: B | after: zz\n```\n');
  assert.match(result, /vm-error/);
  assert.match(result, /Zeile 8/);
});
test('inserts the band after the title', () => {
  const lines = run('---\nvisual:\n  stand: 2026-11-01\n---\n# T\n').split('\n');
  const title = lines.indexOf('# T');
  assert.equal(lines[title + 1], '');
  assert.match(lines[title + 2], /^<div class="vm-band/);
});
test('marks a stand older than seven days as stale', () => {
  assert.match(run('---\nvisual:\n  stand: 2026-10-24\n---\n# T'), /vm-stale/);
  assert.doesNotMatch(run('---\nvisual:\n  stand: 2026-10-25\n---\n# T'), /vm-stale/);
});
test('uses English labels with lang en', () => assert.match(run('---\nvisual:\n  lang: en\n---\n' + fence(block)), /0 of 1 done/));
test('escapes HTML and renders code in labels', () => assert.match(run(fence('- [ ] a: `a` <b>')), /<code>a<\/code> &lt;b&gt;/));
test('rendered HTML contains no blank line', () => {
  const result = run(fence(block));
  assert.doesNotMatch(result.slice(result.indexOf('<div'), result.lastIndexOf('</div>') + 6), /\n\n/);
});

test('reads as-of as the English date field and prefers it to the legacy field', () => {
  const html = run('---\nvisual:\n  as-of: 2026-11-01\n  stand: 2026-10-01\n---\n# T');
  assert.match(html, /Stand 1. November 2026/);
  assert.doesNotMatch(html, /vm-stale/);
});
test('shows the created date next to the stand and a document copy button', () => {
  const html = run('---\nvisual:\n  created: 2026-10-20\n  as-of: 2026-11-01\n---\n# T');
  assert.match(html, /Stand 1. November 2026<\/span><span[^>]*>erstellt 20. Oktober 2026<\/span>/);
  assert.match(html, /<button type="button" class="vm-copy vm-copy-document" data-copied="Kopiert" title="Verweis kopieren" aria-label="Verweis auf dieses Dokument kopieren">/);
  assert.doesNotMatch(html.match(/<div class="vm-band[\s\S]*?<\/div>/)[0], /data-copy-id/);
});
test('turns a section heading with an id into a clean heading with badges and a copy button', () => {
  const lines = run('## Regeln für das Format {#format updated=2026-11-01}\nText darunter').split('\n');
  assert.equal(lines[0], '<div id="format" class="vm-anchor"></div>');
  assert.equal(lines[1], '');
  assert.equal(lines[2], '## Regeln für das Format');
  assert.match(lines[3], /^<div class="vm-section-meta" id="vm-section-format">/);
  assert.doesNotMatch(lines[3], /vm-id/);
  assert.match(lines[3], /class="vm-badge vm-updated" title="aktualisiert 1. Nov."/);
  assert.match(lines[3], /<button type="button" class="vm-copy vm-copy-section" data-copy-id="format"/);
  assert.equal(lines[4], '');
  assert.equal(lines[5], 'Text darunter');
});
test('flags a section id without date and leaves other headings alone', () => {
  assert.match(run('### Offen {#offen}'), /vm-date-missing/);
  assert.equal(run('## Normal\n\nText'), '## Normal\n\nText');
  assert.equal(run('```\n## Code {#x updated=2026-11-01}\n```'), '```\n## Code {#x updated=2026-11-01}\n```');
});
const badgeDoc = table => `---\nvisual:\n  badges: { fertig: ok, offen: warn, fehlt: bad, läuft: info, später: muted }\n---\n# T\n\n${table}`;
test('turns table cells with a configured word into colored pills', () => {
  const html = run(badgeDoc('| Lieferant | Stand |\n| --- | --- |\n| A | offen |\n| B | Fertig |\n| C | fast fertig |'));
  assert.match(html, /\| A \| <span class="vm-pill vm-pill-warn">offen<\/span> \|/);
  assert.match(html, /\| B \| <span class="vm-pill vm-pill-ok">Fertig<\/span> \|/);
  assert.match(html, /\| C \| fast fertig \|/);
  assert.match(html, /\| Lieferant \| Stand \|/);
});
test('leaves tables alone without badges and inside code fences', () => {
  const table = '| A | B |\n| --- | --- |\n| x | offen |';
  assert.equal(transform(table), table);
  assert.doesNotMatch(run(badgeDoc('```\n' + table + '\n```')), /vm-pill/);
});
test('reads all five colors and ignores unknown ones', () => {
  const html = run(badgeDoc('| S |\n| :-- |\n| fehlt |\n| läuft |\n| später |').replace('später: muted', 'später: muted, egal: lila'));
  assert.match(html, /vm-pill-bad">fehlt/);
  assert.match(html, /vm-pill-info">läuft/);
  assert.match(html, /vm-pill-muted">später/);
  assert.doesNotMatch(html, /vm-pill-lila/);
});
test('turns a card callout into a card with icon, color, title and Markdown body', () => {
  const html = run('> [!card flag green] E51: Pro Werk <b>oder</b> über Werke\n> Entschieden am **30. Oktober**.\n>\n> - erster Punkt\n\nDanach');
  const lines = html.split('\n');
  assert.match(lines[0], /^<div class="vm-card vm-card-green" id="vm-id-e51"><div class="vm-card-head"><span class="vm-card-icon"><svg[^>]*>[\s\S]*?<\/svg><\/span><span class="vm-card-title">E51: Pro Werk &lt;b&gt;oder&lt;\/b&gt; über Werke<\/span><\/div><div class="vm-card-body">$/);
  assert.deepEqual(lines.slice(1, 7), ['', 'Entschieden am **30. Oktober**.', '', '- erster Punkt', '', '</div></div>']);
  assert.equal(lines[7], '');
  assert.equal(lines[8], 'Danach');
});
test('accepts icon and color in any order, aliases and no body', () => {
  const html = run('> [!card warn question] Offene Frage');
  assert.match(html, /^<div class="vm-card vm-card-yellow">/);
  assert.match(html, /<span class="vm-card-icon"><svg class="vm-card-svg vm-card-svg-question"/);
  assert.doesNotMatch(html, /vm-card-body/);
  assert.match(run('> [!card] Nur Titel'), /^<div class="vm-card vm-card-grey"><div class="vm-card-head"><span class="vm-card-title">Nur Titel<\/span><\/div><\/div>$/m);
});
test('leaves normal quotes, GitHub callouts and fenced cards alone', () => {
  for (const text of ['> Ein Zitat', '> [!NOTE]\n> Hinweis', '```\n> [!card flag green] Code\n```']) assert.equal(run(text), text);
});
test('marks internal pages in the band and in the top margin of every PDF page', () => {
  const result = run('---\nvisual:\n  as-of: 2026-11-01\n  share: intern\n---\n# T\n');
  assert.match(result, /<span class="vm-band-share"><svg class="vm-lock-icon"[\s\S]*?<\/svg>Intern<\/span>/);
  assert.match(result, /<\/div><style class="vm-watermark">@page \{ @top-right \{ content: "INTERN · nicht weitergeben · Stand 1\. November 2026";/);
  assert.match(run('---\nvisual:\n  share: internal\n  lang: en\n---\n# T\n'), /content: "INTERNAL · do not share";/);
  assert.match(run('---\nvisual:\n  as-of: "1.11. </style>"\n  share: intern\n---\n# T\n'), /Stand 1\.11\. \\3c \/style>"/);
  assert.doesNotMatch(run('---\nvisual:\n  as-of: 2026-11-01\n  share: public\n---\n# T\n'), /vm-watermark|vm-band-share/);
});
