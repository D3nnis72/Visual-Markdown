import test from 'node:test';
import assert from 'node:assert/strict';
import { transform } from '../src/core.js';
import { parseFlowchart, usedKinds } from '../src/mermaid.js';
import { parseFlow } from '../src/blocks/flow.js';

const fence = (kind, body) => `# T\n\n\`\`\`${kind}\n${body}\n\`\`\`\n`;
const messages = result => result.errors.map(error => `${error.line} ${error.message}`);

test('a Mermaid diagram gets the legend of the node kinds it uses', () => {
  const html = transform(fence('mermaid', 'flowchart LR\n  A["Export"]:::code --> B{{"Sicher?"}}:::gate\n  B -- ja --> C[Prüfen]\n  class C human'));
  assert.match(html, /```\n\n<div class="vm-mermaid-legend"><span class="vm-legend-item vm-kind-code"><i><\/i>Code<\/span><span class="vm-legend-item vm-kind-human"><i><\/i>Mensch<\/span><span class="vm-legend-item vm-kind-gate"><i><\/i>Entscheidung<\/span><\/div>/);
});

test('no legend for a single kind, status classes or other code blocks', () => {
  const one = fence('mermaid', 'flowchart LR\n  A:::code --> B:::code');
  assert.equal(transform(one), one);
  const status = fence('mermaid', 'flowchart LR\n  A:::ok --> B:::warn --> C:::accent');
  assert.equal(transform(status), status);
  const other = fence('js', 'a:::code; b:::llm');
  assert.equal(transform(other), other);
});

test('reads nodes, labels, kinds and labeled edges of a flowchart', () => {
  const { nodes, edges } = parseFlowchart([
    'flowchart LR',
    '  a["<b>Daten</b><br/>prüfen"]:::code --> b{{"Was tun?"}}:::gate',
    '  b -->|"nicht erklärt"| c[Verhandeln] & d(["Annehmen"])',
    '  b -- kauft woanders --> e',
    '  b -.-> f@{ shape: rect }',
    '  class c human',
  ]);
  assert.deepEqual([...nodes.values()].map(node => [node.id, node.title, node.kind]), [
    ['a', 'Daten', 'code'], ['b', 'Was tun?', 'gate'], ['c', 'Verhandeln', 'human'], ['d', 'Annehmen', null], ['e', 'e', null], ['f', 'f', null],
  ]);
  assert.deepEqual(edges.map(edge => `${edge.from}>${edge.to}:${edge.label}`), ['a>b:', 'b>c:"nicht erklärt"', 'b>d:"nicht erklärt"', 'b>e:kauft woanders', 'b>f:']);
  assert.deepEqual(usedKinds(['a:::llm --> b:::code', 'class c store']), ['code', 'llm', 'store']);
});

test('flow numbers the noted nodes and lists the notes with kind, badge and exits', () => {
  const md = [
    '---', 'visual:', '  badges: { idee: muted, von hand: info }', '---', '# T', '',
    '```flow', 'says: Je Position.', 'flowchart LR',
    '  daten[Datenfehler prüfen]:::code --> was{{"Was tun?"}}:::gate',
    '  was -->|nicht erklärt| ziel["Zielpreis"]:::human',
    '  was -->|erklärt| ann(["Annehmen"])',
    '  was --> later',
    '---',
    'daten: Einheit und Menge müssen passen. | von Hand',
    'was: Nur der Category Owner ändert den Zielpreis.',
    '  Zweite Zeile.',
    'ziel: Baseline als Betrag. | Neu',
    'later: Spätere Wave.',
    '```', '',
  ].join('\n');
  const html = transform(md);
  assert.match(html, /<div class="vm-flow-says">Je Position\.<\/div>/);
  assert.match(html, /daten\["<b>1<\/b> Datenfehler prüfen"\]:::code --> was\{\{"<b>2<\/b> Was tun\?"\}\}:::gate/);
  assert.match(html, /ziel\["<b>3<\/b> Zielpreis"\]/);
  assert.match(html, /ann\(\["Annehmen"\]\)/);
  assert.match(html, / {4}later\["<b>4<\/b> later"\]\n```/);
  assert.match(html, /<div class="vm-flow-note vm-kind-code" id="vm-flow-7-daten"><span class="vm-flow-no">1<\/span>/);
  assert.match(html, /<span class="vm-flow-kind">Code<\/span><span class="vm-pill vm-pill-info">von Hand<\/span>/);
  assert.match(html, /<span class="vm-pill vm-pill-muted">Neu<\/span>/);
  assert.match(html, /Nur der Category Owner ändert den Zielpreis\. Zweite Zeile\./);
  assert.match(html, /<li><span class="vm-flow-out">nicht erklärt<\/span> → <span class="vm-flow-ref vm-kind-human">3<\/span> Zielpreis<\/li><li><span class="vm-flow-out">erklärt<\/span> → Annehmen<\/li><\/ul>/);
  assert.equal((html.match(/vm-mermaid-legend/g) ?? []).length, 1);
});

test('flow reports a missing diagram, separator, unknown and repeated nodes', () => {
  const parse = text => parseFlow(text.split('\n'), 2, 'de');
  assert.deepEqual(messages(parse('a: b')), ['2 Über den Notizen fehlt ein Mermaid-Flowchart, also eine Zeile mit „flowchart“ oder „graph“']);
  assert.deepEqual(messages(parse('flowchart LR\n  a --> b')), ['2 Zwischen Diagramm und Notizen fehlt die Trennzeile „---“']);
  assert.deepEqual(messages(parse('titel: x\nflowchart LR\n  a --> b\n---\nc: x\na: y\na: z\nfrei')), [
    '2 Vor dem Diagramm ist nur „says: …“ erlaubt',
    '6 Den Knoten „c“ gibt es im Diagramm nicht',
    '8 Zu „a“ gibt es schon eine Notiz',
    '9 Notizen sehen so aus: „knoten: Erklärung | Badge“',
  ]);
  assert.deepEqual(messages(parse('flowchart LR\n  a --> b\n---')), ['4 Der flow-Block braucht mindestens eine Notiz, ohne Notizen reicht ein normaler mermaid-Block']);
});
