import test from 'node:test';
import assert from 'node:assert/strict';
import MarkdownIt from 'markdown-it';
import { transform } from '../src/core.js';
import { checkMarkdown } from '../src/check.js';

const block = (body, metadata = 'to: Victor', fence = '```') => `${fence}message\n${metadata}\n---\n${body}\n${fence}`;

test('message shows paragraphs, emphasis and links, with separate copy controls', () => {
  const html = transform(block('Hi **Victor**, check [ASK-11014](https://linear.app/asklio/issue/ASK-11014).\n\nWhich request?'));
  assert.match(html, /vm-message-title">An Victor</);
  assert.match(html, /<strong>Victor<\/strong>/);
  assert.match(html, /<a href="https:\/\/linear.app\/asklio\/issue\/ASK-11014">ASK-11014<\/a>/);
  assert.match(html, /<\/p>&#10;<p>Which request\?/);
  assert.match(html, /data-copy-format="rich">Nachricht kopieren/);
  assert.match(html, /data-copy-format="markdown">Markdown kopieren/);
  assert.match(new MarkdownIt({ html: true }).render(html), /<section class="vm-message"/);
  assert.doesNotMatch(html, /\n\n/);
});

test('message preserves source whitespace and escapes source and recipient HTML', () => {
  const source = '\nHi "Victor" & team.  \n\n<script>alert(1)</script>\n';
  const html = transform(block(source, 'to: <img src=x onerror=alert(1)>'));
  const encoded = html.match(/data-message-markdown="([^"]*)"/)[1];
  assert.equal(encoded, '&#10;Hi &quot;Victor&quot; &amp; team.  &#10;&#10;&lt;script&gt;alert(1)&lt;/script&gt;&#10;');
  assert.doesNotMatch(html, /<script>|<img/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test('message rejects unsafe links, raw HTML and remote images in preview', () => {
  const html = transform(block('[bad](javascript:alert%281%29)\n\n![image](https://example.com/track.png)\n\n<iframe src="https://example.com"></iframe>'));
  assert.doesNotMatch(html, /href="javascript:|<img|<iframe/);
});

test('message validates the separator, metadata and empty body with file lines', () => {
  assert.match(transform('```message\nto: Victor\nHi\n```'), /vm-error/);
  for (const metadata of ['recipient: Victor', 'to: Victor\nto: Kevin', 'to:']) {
    assert.match(transform(block('Hi', metadata)), /vm-error/);
  }
  assert.match(transform(block(' \n')), /Die Nachricht ist leer/);
  assert.match(transform('\n' + block('Hi', 'unknown: x')), /Zeile 3/);
});

test('message supports no recipient, English labels and nested fenced code', () => {
  const html = transform('---\nvisual:\n  lang: en\n---\n' + block('Check:\n\n```js\nconst x = 1;\n```', '', '````'));
  assert.match(html, /vm-message-title">Message</);
  assert.match(html, /Copy message/);
  assert.match(html, /<pre><code class="language-js">const x = 1;/);
  const example = '````markdown\n' + block('Hi') + '\n````';
  assert.equal(transform(example), example);
});

test('message is recognized by the document checker', () => {
  const result = checkMarkdown(block('Hi'));
  assert.equal(result.filter(item => item.level === 'error').length, 0);
});
