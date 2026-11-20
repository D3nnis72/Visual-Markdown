import { escapeHtml } from './html.js';
import { t } from './labels.js';

/** Node kinds the theme colors (style.less, skill mermaid-theme), in legend order. Status classes vary in meaning and stay out. */
export const KINDS = ['code', 'llm', 'human', 'gate', 'store'];

const CLASS_LINE = /^\s*class\s+([\w\s,-]+?)\s+([\w-]+)\s*;?\s*$/;
const SKIP_LINE = /^\s*(?:%%|subgraph\b|end\b|classDef\b|class\s|style\s|linkStyle\b|click\s|direction\s|flowchart\b|graph\b)/;

/** Kinds used through `:::kind` or `class a,b kind`, in legend order. */
export function usedKinds(lines) {
  const found = new Set();
  for (const line of lines) {
    for (const match of line.matchAll(/:::([\w-]+)/g)) found.add(match[1]);
    const classes = CLASS_LINE.exec(line);
    if (classes) found.add(classes[2]);
  }
  return KINDS.filter(kind => found.has(kind));
}

export const kindLabel = (kind, lang) => t(lang, `kind_${kind}`);

/** One line of colored dots under a diagram; a single kind needs no legend. */
export function renderLegend(kinds, lang) {
  if (kinds.length < 2) return '';
  const items = kinds.map(kind => `<span class="vm-legend-item vm-kind-${kind}"><i></i>${escapeHtml(kindLabel(kind, lang))}</span>`);
  return `<div class="vm-mermaid-legend">${items.join('')}</div>`;
}

// Shape openers, longest first, with the closers Mermaid accepts for them.
const SHAPES = [
  ['(((', [')))']], ['([', ['])']], ['[[', [']]']], ['[(', [')]']], ['((', ['))']], ['{{', ['}}']],
  ['[/', ['/]', '\\]']], ['[\\', ['\\]', '/]']], ['[', [']']], ['(', [')']], ['{', ['}']], ['>', [']']],
];
const ID = /[A-Za-z_À-￿][\wÀ-￿]*(?:-[\wÀ-￿]+)*/y;
const KIND = /:::([\w-]+)/y;
const TEXT_ARROW = /<?(?:--|==|-\.)\s+(\S.*?)\s+(?:-{2,}|={2,}|\.+-+)[>ox]?/y;
const ARROW = /<?(?:-{2,}|={2,}|-\.+-?|~{3,})[>ox]?/y;
const PIPE_LABEL = /\s*\|([^|]*)\|/y;

const sticky = (regex, text, at) => {
  regex.lastIndex = at;
  return regex.exec(text);
};

/** A shape after a node id: where its label sits in the line and whether it is quoted. */
function readShape(line, at) {
  const shape = SHAPES.find(([open]) => line.startsWith(open, at));
  if (!shape) return null;
  const [open, closers] = shape;
  let p = at + open.length;
  while (line[p] === ' ') p++;
  if (line[p] === '"') {
    const endQuote = line.indexOf('"', p + 1);
    if (endQuote < 0) return null;
    let q = endQuote + 1;
    while (line[q] === ' ') q++;
    const close = closers.find(closer => line.startsWith(closer, q));
    if (!close) return null;
    return { labelStart: p, labelEnd: endQuote + 1, quoted: true, text: line.slice(p + 1, endQuote), end: q + close.length };
  }
  let best = null;
  for (const closer of closers) {
    const index = line.indexOf(closer, p);
    if (index >= 0 && (!best || index < best.index)) best = { index, closer };
  }
  if (!best) return null;
  return { labelStart: p, labelEnd: best.index, quoted: false, text: line.slice(p, best.index).trim(), end: best.index + best.closer.length };
}

/** Plain text of a label: the first line before `<br>`, without tags and quotes. */
export function labelTitle(text) {
  return text.split(/<br\s*\/?>/i)[0].replace(/<[^>]+>/g, '').replace(/#quot;/g, '"').replace(/\s+/g, ' ').trim();
}

/**
 * Reads the nodes and edges of a flowchart well enough to number nodes and list where a decision leads.
 * Unknown syntax is skipped, never an error: Mermaid itself reports broken diagrams.
 */
export function parseFlowchart(lines) {
  const nodes = new Map();
  const edges = [];
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, { id, title: id, kind: null, def: null });
    return nodes.get(id);
  };
  lines.forEach((line, lineIndex) => {
    const classes = CLASS_LINE.exec(line);
    if (classes) {
      for (const id of classes[1].split(',').map(part => part.trim()).filter(Boolean)) {
        const entry = node(id);
        if (!entry.kind && KINDS.includes(classes[2])) entry.kind = classes[2];
      }
      return;
    }
    if (SKIP_LINE.test(line) || !line.trim()) return;
    const tokens = [];
    let p = 0;
    while (p < line.length) {
      const char = line[p];
      if (/[\s;]/.test(char)) { p++; continue; }
      if (char === '&') { tokens.push({ type: 'and' }); p++; continue; }
      if (char === '@' && line[p + 1] === '{') { const close = line.indexOf('}', p); p = close < 0 ? line.length : close + 1; continue; }
      let match = sticky(TEXT_ARROW, line, p);
      if (match) { tokens.push({ type: 'edge', label: match[1] }); p += match[0].length; continue; }
      match = sticky(ARROW, line, p);
      if (match) {
        p += match[0].length;
        const label = sticky(PIPE_LABEL, line, p);
        if (label) p += label[0].length;
        tokens.push({ type: 'edge', label: label ? label[1] : '' });
        continue;
      }
      match = /[\wÀ-￿-]/.test(line[p - 1] ?? '') ? null : sticky(ID, line, p);
      if (match) {
        const id = match[0];
        const entry = node(id);
        p += id.length;
        const shape = readShape(line, p);
        if (shape) {
          if (!entry.def) {
            entry.def = { line: lineIndex, ...shape };
            entry.title = labelTitle(shape.text) || id;
          }
          p = shape.end;
        }
        const kind = sticky(KIND, line, p);
        if (kind) {
          if (!entry.kind && KINDS.includes(kind[1])) entry.kind = kind[1];
          p += kind[0].length;
        }
        tokens.push({ type: 'node', id });
        continue;
      }
      p++;
    }
    // Groups of nodes joined by "&", with an edge between neighbouring groups.
    let left = [];
    let current = [];
    let pending = null;
    for (const token of tokens) {
      if (token.type === 'node') current.push(token.id);
      else if (token.type === 'edge') {
        if (pending) for (const from of left) for (const to of current) edges.push({ from, to, label: pending.label });
        left = current;
        current = [];
        pending = token;
      }
    }
    if (pending) for (const from of left) for (const to of current) edges.push({ from, to, label: pending.label });
  });
  return { nodes, edges };
}

/** The diagram source with "<b>n</b>" in front of each numbered node's label. */
export function numberNodes(lines, nodes, numbers) {
  const out = [...lines];
  const extra = [];
  const byLine = new Map();
  for (const [id, number] of numbers) {
    const def = nodes.get(id)?.def;
    if (!def) {
      extra.push(`    ${id}["<b>${number}</b> ${id}"]`);
      continue;
    }
    if (!byLine.has(def.line)) byLine.set(def.line, []);
    byLine.get(def.line).push({ def, number });
  }
  for (const [lineIndex, entries] of byLine) {
    let line = out[lineIndex];
    for (const { def, number } of entries.sort((a, b) => b.def.labelStart - a.def.labelStart)) {
      const tag = `<b>${number}</b> `;
      line = def.quoted || def.text.includes('"')
        ? line.slice(0, def.labelStart + (def.quoted ? 1 : 0)) + tag + line.slice(def.labelStart + (def.quoted ? 1 : 0))
        : `${line.slice(0, def.labelStart)}"${tag}${def.text}"${line.slice(def.labelEnd)}`;
    }
    out[lineIndex] = line;
  }
  // Nodes that never got a label: append one, so Mermaid keeps the order in which they first appear.
  return [...out, ...extra];
}
