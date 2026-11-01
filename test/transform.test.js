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
  assert.equal(lines[0], '## Regeln für das Format');
  assert.match(lines[1], /^<div class="vm-section-meta" id="vm-section-format">/);
  assert.match(lines[1], /<code class="vm-id"[^>]*>format<\/code>/);
  assert.match(lines[1], /class="vm-badge vm-updated" title="aktualisiert 1. Nov."/);
  assert.match(lines[1], /<button type="button" class="vm-copy vm-copy-section" data-copy-id="format"/);
  assert.equal(lines[2], '');
  assert.equal(lines[3], 'Text darunter');
});
test('flags a section id without date and leaves other headings alone', () => {
  assert.match(run('### Offen {#offen}'), /vm-date-missing/);
  assert.equal(run('## Normal\n\nText'), '## Normal\n\nText');
  assert.equal(run('```\n## Code {#x updated=2026-11-01}\n```'), '```\n## Code {#x updated=2026-11-01}\n```');
});
