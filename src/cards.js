import { inline } from './html.js';
import { svg } from './icons.js';

// "> [!card flag green] Title" with a normal Markdown body in the following "> " lines.
// GitHub shows it as a plain quote, so the source stays readable without the renderer.
export const CARD_START = /^>\s?\[!card((?:\s+[a-z-]+)*)\s*\]\s*(.*)$/i;
const COLORS = {
  green: 'green', yellow: 'yellow', red: 'red', indigo: 'indigo', grey: 'grey', gray: 'grey',
  ok: 'green', warn: 'yellow', bad: 'red', info: 'indigo', muted: 'grey',
};
const ICON_SHAPES = {
  flag: '<path d="M3.75 14V2.5M3.75 3h8.5l-2 3 2 3h-8.5"/>',
  question: '<circle cx="8" cy="8" r="6.25"/><path d="M6.25 6.25a1.85 1.85 0 0 1 3.6.6c0 1.25-1.85 1.6-1.85 2.65M8 11.4v.1"/>',
  check: '<circle cx="8" cy="8" r="6.25"/><path d="m5.4 8.15 1.75 1.75 3.45-3.6"/>',
  warning: '<path d="M8 2.5 14 13H2z"/><path d="M8 6.5v3M8 11.25v.1"/>',
  bulb: '<path d="M6 12.5h4M6.5 14.25h3M5.25 10c-1-.85-1.75-2-1.75-3.5a4.5 4.5 0 0 1 9 0c0 1.5-.75 2.65-1.75 3.5"/>',
  info: '<circle cx="8" cy="8" r="6.25"/><path d="M8 7.25v3.75M8 5v.1"/>',
  pin: '<path d="M8 14.25s4.5-4.1 4.5-7.75a4.5 4.5 0 0 0-9 0c0 3.65 4.5 7.75 4.5 7.75z"/><circle cx="8" cy="6.5" r="1.5"/>',
  clock: '<circle cx="8" cy="8" r="6.25"/><path d="M8 5v3.25l2.1 1.3"/>',
  note: '<path d="M4 2.25h5.5L12.75 5.5v8.25H4z"/><path d="M6.25 8.5h4M6.25 11h4"/>',
};

// A card whose title starts with an ID defines it, so the ID elsewhere in the text links here: "E51: Pro Werk
// anfragen", "Frage 6: Anhänge?", "ER-4: …".
export const ID_TITLE = /^(\p{Lu}[\p{L}]*[ -]?\d+)\s*:\s+(.+)$/u;
export const idAnchor = id => `vm-id-${id.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-')}`;

export const CARD_COLORS = Object.keys(COLORS);
export const CARD_ICONS = Object.keys(ICON_SHAPES);

/** Renders the card that starts at lines[start]; returns the output lines and the last consumed index. */
export function renderCard(lines, start, link = null) {
  const match = CARD_START.exec(lines[start]);
  if (!match) return null;
  const tokens = match[1].trim().toLowerCase().split(/\s+/).filter(Boolean);
  const color = COLORS[tokens.find(token => COLORS[token])] ?? 'grey';
  const iconName = tokens.find(token => ICON_SHAPES[token]);
  let end = start;
  const body = [];
  while (end + 1 < lines.length && /^>/.test(lines[end + 1])) body.push(lines[++end].replace(/^>\s?/, ''));
  if (link) body.splice(0, body.length, ...body.map(line => link(line)));
  while (body.length && !body[body.length - 1].trim()) body.pop();
  const icon = iconName ? `<span class="vm-card-icon">${svg(`vm-card-svg vm-card-svg-${iconName}`, 16, ICON_SHAPES[iconName])}</span>` : '';
  const id = ID_TITLE.exec(match[2].trim());
  const head = `<div class="vm-card vm-card-${color}"${id ? ` id="${idAnchor(id[1])}"` : ''}><div class="vm-card-head">${icon}<span class="vm-card-title">${inline(match[2].trim())}</span></div>`;
  const output = body.length ? [`${head}<div class="vm-card-body">`, '', ...body, '', '</div></div>', ''] : [`${head}</div>`, ''];
  if (end + 1 < lines.length && !lines[end + 1].trim()) end++;
  return { output, end };
}
