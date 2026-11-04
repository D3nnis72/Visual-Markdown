import test from 'node:test';
import assert from 'node:assert/strict';
import { patchSource } from '../scripts/patch-mpe.mjs';

const original = 'x;if(Gn===hx.PreviewsOnly&&E1(Er))(await n(ht)).initPreview({sourceUri:ht,document:Er,cursorLine:Xt,viewOptions:{viewColumn:wr.ViewColumn.Active,preserveFocus:!0}});else{y()}';

test('opens linked files like the Explorer and hands the anchor to the preview', () => {
  const { source, status } = patchSource(original);
  assert.equal(status, 'patched');
  assert.match(source, /if\(Gn===hx\.PreviewsOnly&&E1\(Er\)\)\{\/\*visual-markdown:link-patch\*\/let vmUri=Er\.uri;/);
  assert.match(source, /wr\.commands\.executeCommand\("vscode\.openWith",vmUri,"markdown-preview-enhanced",wr\.ViewColumn\.Active\)/);
  assert.match(source, /ht\.fragment\?\{command:"vmScrollToAnchor",id:ht\.fragment\}/);
  assert.match(source, /\}else\{y\(\)\}$/);
  assert.doesNotThrow(() => new Function(`async function f(){${source}}`));
  assert.equal(patchSource(source).status, 'already');
  assert.equal(patchSource('nothing here').status, 'missing');
});
