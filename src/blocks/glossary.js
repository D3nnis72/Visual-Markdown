import { escapeHtml, inline } from '../html.js';
import { t } from '../labels.js';

// "PO: Bestellung im SAP, eine Nummer kann mehrere Positionen haben". The term is everything before the first ": ".
const ENTRY = /^([^:]+?):\s+(.+)$/;
export const termAnchor = term => `vm-term-${term.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')}`;

export function parseGlossary(body, firstLine, lang) {
  const entries = [];
  const errors = [];
  body.split(/\r?\n/).forEach((text, index) => {
    if (!text.trim()) return;
    const match = ENTRY.exec(text.trim());
    if (!match) errors.push({ line: firstLine + index, message: t(lang, 'errGlossaryLine') });
    else entries.push({ term: match[1].trim(), meaning: match[2].trim(), line: firstLine + index });
  });
  if (!entries.length && !errors.length) errors.push({ line: firstLine, message: t(lang, 'errGlossaryEmpty') });
  return { entries, errors };
}

/** A normal Markdown table, so it gets the table style; every term carries the anchor the links in the text point to. */
export function renderGlossary({ entries }, lang) {
  const cell = value => value.replace(/\|/g, '\\|');
  return [
    `| ${t(lang, 'glossaryTerm')} | ${t(lang, 'glossaryMeaning')} |`,
    '| --- | --- |',
    ...entries.map(entry => `| <span class="vm-term-def" id="${termAnchor(entry.term)}">${escapeHtml(entry.term)}</span> | ${cell(inline(entry.meaning))} |`),
    '',
  ];
}

export function transformGlossary(lines, start, end, lang) {
  const glossary = parseGlossary(lines.slice(start + 1, end).join('\n'), start + 2, lang);
  return glossary.errors.length ? { errors: glossary.errors } : { output: renderGlossary(glossary, lang) };
}
