import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('parser.js evaluates as one expression and renders steps', async () => {
  const source = await readFile(new URL('../parser.js', import.meta.url), 'utf8');
  const hooks = (0, eval)(`(${source.trim().replace(/[;,]+$/, '')})`);
  assert.match(await hooks.onWillParseMarkdown('```steps\n- [ ] a: A\n```'), /vm-steps/);
  assert.match(await hooks.onWillParseMarkdown('```message\nto: Victor\n---\nHi **Victor**.\n```'), /<strong>Victor<\/strong>/);
  assert.equal(await hooks.onDidParseMarkdown('<p>x</p>'), '<p>x</p>');
});
test('parser.js has no require or import', async () => {
  const source = await readFile(new URL('../parser.js', import.meta.url), 'utf8');
  // Bundled dependencies can contain documentation examples mentioning require().
  assert.doesNotMatch(source.replace(/\/\*[\s\S]*?\*\//g, ''), /\brequire\(|^\s*import\s/m);
});
