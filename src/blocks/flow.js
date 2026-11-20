import { escapeHtml, inline } from '../html.js';
import { t } from '../labels.js';
import { parseFlowchart, numberNodes, usedKinds, renderLegend, kindLabel, labelTitle } from '../mermaid.js';
import { renderSays } from './common.js';

const HEADER = /^\s*(flowchart|graph)\b/;
const NOTE = /^([\wÀ-￿-]+):\s*(\S.*)$/;

/**
 * `flow`: a Mermaid flowchart on top, `---`, then one note per node ("node: text | badge").
 * Mermaid keeps drawing the shape; the block numbers the noted nodes and lists the notes below.
 */
export function parseFlow(lines, firstLine, lang) {
  const errors = [];
  const header = lines.findIndex(line => HEADER.test(line));
  if (header < 0) return { errors: [{ line: firstLine, message: t(lang, 'errFlowDiagram') }] };
  let says = '';
  lines.slice(0, header).forEach((line, index) => {
    const field = /^says:\s*(.*)$/.exec(line.trim());
    if (field) says = field[1];
    else if (line.trim()) errors.push({ line: firstLine + index, message: t(lang, 'errFlowField') });
  });
  const separator = lines.findIndex((line, index) => index > header && line.trim() === '---');
  if (separator < 0) return { errors: [...errors, { line: firstLine, message: t(lang, 'errFlowSeparator') }] };
  const diagram = lines.slice(header, separator);
  const { nodes, edges } = parseFlowchart(diagram);
  const notes = [];
  lines.slice(separator + 1).forEach((text, index) => {
    const line = firstLine + separator + 1 + index;
    if (!text.trim()) return;
    if (/^\s/.test(text) && notes.length) {
      notes[notes.length - 1].text += ` ${text.trim()}`;
      return;
    }
    const match = NOTE.exec(text.trim());
    if (!match) return errors.push({ line, message: t(lang, 'errFlowNote') });
    const [, id, rest] = match;
    if (!nodes.has(id)) return errors.push({ line, message: t(lang, 'errFlowNode', { id }) });
    if (notes.some(note => note.id === id)) return errors.push({ line, message: t(lang, 'errFlowDuplicate', { id }) });
    const cut = rest.lastIndexOf(' | ');
    notes.push({ id, line, text: cut < 0 ? rest.trim() : rest.slice(0, cut).trim(), badge: cut < 0 ? '' : rest.slice(cut + 3).trim() });
  });
  if (!notes.length && !errors.length) errors.push({ line: firstLine + separator, message: t(lang, 'errFlowEmpty') });
  return { says, diagram, nodes, edges, notes, errors };
}

export function renderFlow({ says, diagram, nodes, edges, notes }, lang, { badges = new Map(), anchor = 'vm-flow' } = {}) {
  const numbers = new Map(notes.map((note, index) => [note.id, index + 1]));
  const chip = id => `<span class="vm-flow-ref${nodes.get(id)?.kind ? ` vm-kind-${nodes.get(id).kind}` : ''}">${numbers.get(id)}</span>`;
  const items = notes.map(note => {
    const node = nodes.get(note.id);
    const kind = node.kind;
    const color = note.badge ? badges.get(note.badge.toLowerCase()) ?? 'muted' : '';
    const outs = edges.filter(edge => edge.from === note.id && edge.label.trim()).map(edge => {
      const target = nodes.get(edge.to);
      const ref = numbers.has(edge.to) ? `${chip(edge.to)} ` : '';
      return `<li><span class="vm-flow-out">${escapeHtml(labelTitle(edge.label.replace(/^"|"$/g, '')))}</span> → ${ref}${escapeHtml(target?.title ?? edge.to)}</li>`;
    });
    return [
      `<div class="vm-flow-note${kind ? ` vm-kind-${kind}` : ''}" id="${anchor}-${escapeHtml(note.id)}">`,
      `<span class="vm-flow-no">${numbers.get(note.id)}</span><div class="vm-flow-body">`,
      `<div class="vm-flow-head"><span class="vm-flow-title">${escapeHtml(node.title)}</span>`,
      kind ? `<span class="vm-flow-kind">${escapeHtml(kindLabel(kind, lang))}</span>` : '',
      color ? `<span class="vm-pill vm-pill-${color}">${escapeHtml(note.badge)}</span>` : '',
      '</div>',
      note.text ? `<div class="vm-flow-text">${inline(note.text)}</div>` : '',
      outs.length ? `<ul class="vm-flow-outs">${outs.join('')}</ul>` : '',
      '</div></div>',
    ].join('');
  });
  return [
    ...(says ? [renderSays(says, 'vm-flow-says'), ''] : []),
    '```mermaid',
    ...numberNodes(diagram, nodes, numbers),
    '```',
    '',
    `${renderLegend(usedKinds(diagram), lang)}<div class="vm-flow-notes">${items.join('')}</div>`,
    '',
  ];
}

export function transformFlow(lines, start, end, lang, { badges } = {}) {
  const flow = parseFlow(lines.slice(start + 1, end), start + 2, lang);
  return flow.errors.length ? { errors: flow.errors } : { output: renderFlow(flow, lang, { badges, anchor: `vm-flow-${start + 1}` }) };
}
