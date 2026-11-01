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
  const result = run('---\nid: x\n---\n# T\n\n```steps\n- [ ] a: A\n- [ ] b: B | nach: zz\n```\n');
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
