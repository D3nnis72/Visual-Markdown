import { escapeHtml } from './html.js';

export const BADGE_COLORS = ['ok', 'warn', 'bad', 'info', 'muted'];
const SEPARATOR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

/** Reads `{ offen: warn, fertig: ok }` into a map from lowercase word to color. */
export function parseBadges(value) {
  const map = new Map();
  const body = /^\{(.*)\}$/.exec(String(value ?? '').trim())?.[1] ?? '';
  for (const entry of body.split(',')) {
    const [word, color] = entry.split(':').map(part => part?.trim().replace(/^(["'])(.*)\1$/, '$2'));
    if (word && BADGE_COLORS.includes(color)) map.set(word.toLowerCase(), color);
  }
  return map;
}

export const isTableSeparator = line => line.includes('-') && SEPARATOR.test(line);
export const isTableRow = line => line.trim().startsWith('|');

/** Wraps every body cell whose whole text is a configured word in a colored pill. */
export function renderTableRow(line, badges) {
  return line.replace(/(\|)([^|]*)(?=\|)/g, (match, pipe, cell) => {
    const word = cell.trim();
    const color = badges.get(word.toLowerCase());
    return color ? `${pipe}${cell.replace(word, `<span class="vm-pill vm-pill-${color}">${escapeHtml(word)}</span>`)}` : match;
  });
}
