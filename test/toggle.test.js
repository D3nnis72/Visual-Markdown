import test from 'node:test';
import assert from 'node:assert/strict';
import MarkdownIt from 'markdown-it';
import { transform } from '../src/core.js';
import { checkMarkdown } from '../src/check.js';

const block = body => '````toggle\n' + body + '\n````';
const md = new MarkdownIt({ html: true });

test('toggle renders Markdown, tables, relative links and inner code fences, collapsed by default', () => {
  const html = md.render(transform(block('title: Technischer Kontext\n---\n**Beschreibung**\n\n- [Quelle](details.md#test)\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n```js\nconst a = 1;\n```')));
  assert.match(html, /<details class="vm-toggle"><summary>Technischer Kontext<\/summary>/);
  assert.match(html, /<strong>Beschreibung<\/strong>/);
  assert.match(html, /href="details.md#test"/);
  assert.match(html, /<table>/);
  assert.match(html, /<code class="language-js">const a = 1;/);
  assert.doesNotMatch(html, /language-toggle|<p><details/);
});

test('toggle supports open state and keeps markup inert', () => {
  const html = transform(block('title: <img src=x onerror=alert(1)>\nopen: true\n---\n<script>alert(1)</script>'));
  assert.match(html, /class="vm-toggle" open/);
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<img|<script/);
  assert.doesNotMatch(transform(block('title: T\nopen: false\n---\nText')), /vm-toggle" open/);
});

test('renderer and checker report malformed toggle metadata and empty content', () => {
  for (const body of ['title: T', 'title: T\nopen: yes\n---\nBody', 'title: A\ntitle: B\n---\nBody', '---\nBody', 'title: T\n---']) {
    assert.match(transform(block(body)), /vm-error/);
    assert.ok(checkMarkdown(block(body)).some(finding => finding.level === 'error'));
  }
  assert.match(transform('---\nvisual:\n  lang: en\n---\n' + block('---')), /The toggle needs a title/);
});

test('dash dividers leave prose, code and front matter unchanged', () => {
  const output = transform('---\ntitle: Example\n---\n# T\n\n—\n\nText — Text\n\n–\n\n```text\n—\n```\n\n    —');
  assert.equal(output.match(/<hr class="vm-divider">/g).length, 2);
  assert.ok(output.startsWith('---\ntitle: Example\n---'));
  assert.match(output, /Text — Text/);
  assert.match(output, /```text\n—\n```/);
  assert.ok(output.endsWith('    —'));
  assert.match(md.render(transform('Before\n\n---\n\nAfter')), /<hr>/);
});
