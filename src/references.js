import { escapeHtml } from './html.js';
import { CARD_START, ID_TITLE, idAnchor } from './cards.js';
import { parseGlossary, termAnchor } from './blocks/glossary.js';

const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const plain = text => text.replace(/`([^`]*)`/g, '$1').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*\*?|__?/g, '');

/** IDs from card titles and terms from `glossary` blocks, with the line of each definition. */
export function collectReferences(lines, startLine = 0, lang = 'de') {
  const ids = new Map();
  const terms = new Map();
  const duplicates = [];
  const add = (map, key, value) => (map.has(key) ? duplicates.push({ key, line: value.line }) : map.set(key, value));
  for (let i = startLine; i < lines.length; i++) {
    const open = FENCE.exec(lines[i]);
    if (open) {
      let end = i + 1;
      while (end < lines.length) {
        const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(lines[end]);
        if (close && close[1][0] === open[1][0] && close[1].length >= open[1].length) break;
        end++;
      }
      if (open[2].trim() === 'glossary' && !lines[i].startsWith(' ')) {
        for (const entry of parseGlossary(lines.slice(i + 1, end).join('\n'), i + 2, lang).entries) add(terms, entry.term, entry);
      }
      i = end;
      continue;
    }
    const card = CARD_START.exec(lines[i]);
    const id = card && ID_TITLE.exec(card[2].trim());
    if (id) add(ids, id[1], { title: plain(card[2].trim()), line: i + 1 });
  }
  return { ids, terms, duplicates };
}

// Code spans, links, images, HTML tags and bare URLs are left alone.
const PROTECTED = /(`+)[\s\S]*?\1|!?\[[^\]]*\]\([^)]*\)|<[^>]+>|https?:\/\/\S+/g;
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Returns a function that links IDs and terms in one line of Markdown. Every ID links to its card; a term links
 * to the glossary only the first time it appears in a section, so the text does not fill with underlines.
 * The explanation shows on hover. Call `section()` at each heading.
 */
export function createLinker({ ids, terms }) {
  const keys = [...ids.keys(), ...terms.keys()].sort((a, b) => b.length - a.length);
  if (!keys.length) return null;
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_-])(${keys.map(escapeRegExp).join('|')})(?![\\p{L}\\p{N}_-])`, 'gu');
  let seen = new Set();
  const replace = text => text.replace(pattern, key => {
    if (ids.has(key)) return `<a class="vm-xref" href="#${idAnchor(key)}" title="${escapeHtml(ids.get(key).title)}">${escapeHtml(key)}</a>`;
    if (seen.has(key)) return key;
    seen.add(key);
    return `<a class="vm-term" href="#${termAnchor(key)}" title="${escapeHtml(plain(terms.get(key).meaning))}">${escapeHtml(key)}</a>`;
  });
  const link = line => {
    let result = '';
    let last = 0;
    for (const match of line.matchAll(PROTECTED)) {
      result += replace(line.slice(last, match.index)) + match[0];
      last = match.index + match[0].length;
    }
    return result + replace(line.slice(last));
  };
  link.section = () => { seen = new Set(); };
  return link;
}
