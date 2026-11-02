import test from 'node:test';
import assert from 'node:assert/strict';
import { transform } from '../src/core.js';
import { checkMarkdown } from '../src/check.js';

const page = `# T

> [!card flag green] E51: Pro Werk \`anfragen\`
> Ersetzt E47 und klärt Frage 6.

> [!card question yellow] Frage 6: Anhänge für alle Positionen?

\`\`\`glossary
PO: Bestellung im SAP, eine Nummer hat mehrere Positionen
MPE: Markdown Preview Enhanced
\`\`\`

## Stand {#stand updated=2026-11-02}

Wegen E51 fragen wir pro Werk an. Jede PO und noch eine PO, aber nicht POS, \`E51\` oder [E51](x.md).

| PO | Entscheidung |
| --- | --- |
| 1 | E51 |

## Weiter

Die PO wieder, E99 bleibt Text.
`;

test('links IDs to their card and explains terms on hover', () => {
  const html = transform(page);
  assert.match(html, /<div class="vm-card vm-card-green" id="vm-id-e51">/);
  assert.match(html, /<div class="vm-card vm-card-yellow" id="vm-id-frage-6">/);
  assert.match(html, /Wegen <a class="vm-xref" href="#vm-id-e51" title="E51: Pro Werk anfragen">E51<\/a> fragen/);
  assert.match(html, /klärt <a class="vm-xref" href="#vm-id-frage-6" title="Frage 6: Anhänge für alle Positionen\?">Frage 6<\/a>\./);
  assert.match(html, /Ersetzt E47 und/, 'undefined IDs stay text');
  assert.match(html, /<span class="vm-term-def" id="vm-term-po">PO<\/span> \| Bestellung im SAP/);
});

test('a term is linked once per section, never in code, links, headings or words that contain it', () => {
  const html = transform(page);
  const stand = html.slice(html.indexOf('Wegen'), html.indexOf('## Weiter'));
  assert.equal(stand.match(/class="vm-term"/g).length, 1);
  assert.match(stand, /noch eine PO, aber nicht POS, `E51` oder \[E51\]\(x\.md\)/);
  assert.match(html, /## Weiter\n\nDie <a class="vm-term" href="#vm-term-po"/);
  assert.match(html, /E99 bleibt Text/);
});

test('warns about IDs and terms defined twice', () => {
  const md = `---\nvisual:\n  created: 2026-11-01\n  as-of: 2026-11-09\n---\n# T\n\n> [!card flag] E1: A\n\n> [!card flag] E1: B\n`;
  const findings = checkMarkdown(md, { today: new Date('2026-11-10T12:00:00') }).map(f => `${f.line} ${f.level} ${f.message}`);
  assert.deepEqual(findings, ['10 warning `E1` ist doppelt definiert, verlinkt wird die erste Stelle']);
});
