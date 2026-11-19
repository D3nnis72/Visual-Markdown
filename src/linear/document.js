import { readVisual } from '../frontmatter.js';
import { parseSteps } from '../steps/parse.js';
import { validateSteps } from '../steps/compute.js';
import { parseDate } from '../dates.js';

const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/;
export function ticketIdentifier(link) {
  const match = /^\[[^\]]+\]\((https:\/\/[^\s)]+)\)$/.exec(link ?? '');
  if (!match) return null;
  try {
    const url = new URL(match[1]);
    if (url.hostname !== 'linear.app' || url.port || url.username || url.password) return null;
    return /^\/[^/]+\/issue\/([a-z][a-z0-9]*-\d+)(?:\/|$)/i.exec(url.pathname)?.[1].toUpperCase() ?? null;
  } catch { return null; }
}

/** Only opted-in rows in closed, valid steps blocks are editable. */
export function collectTickets(markdown) {
  const lines = markdown.split(/\r?\n/);
  const { visual, endLine } = readVisual(markdown);
  const tickets = [];
  const errors = [];
  for (let i = endLine + 1; i < lines.length; i++) {
    const open = fence.exec(lines[i]);
    if (!open) continue;
    let end = i + 1;
    while (end < lines.length) {
      const close = fence.exec(lines[end]);
      if (close && !close[2].trim() && close[1][0] === open[1][0] && close[1].length >= open[1].length) break;
      end++;
    }
    if (!lines[i].startsWith(' ') && open[2].trim() === 'steps' && end < lines.length) {
      const parsed = parseSteps(lines.slice(i + 1, end).join('\n'), i + 2, visual?.lang ?? 'de');
      const invalid = [...parsed.errors, ...validateSteps(parsed.steps, visual?.lang ?? 'de')];
      for (const step of parsed.steps) {
        const names = lines[step.line - 1].split(' | ').slice(1).map(part => part.split(':')[0].trim());
        if (new Set(names).size !== names.length) invalid.push({ line: step.line, message: 'duplicate fields' });
      }
      // Ignore errors in unrelated/unmarked blocks during broad project discovery.
      if (parsed.steps.some(step => step.ticketSync === 'true')) {
        errors.push(...invalid);
        if (!invalid.length) for (const step of parsed.steps) {
          if (step.ticketSync !== 'true') continue;
          const id = ticketIdentifier(step.ticket);
          if (id) tickets.push({ id, index: step.line - 1 });
          else errors.push({ line: step.line, message: 'ticket-sync requires a Linear HTTPS issue URL' });
        }
      }
    }
    i = end;
  }
  return { tickets, errors };
}

export function safeFact(value) {
  return typeof value === 'string' && value.trim().length > 0 && !/[\r\n\u0000-\u001f\u007f]/.test(value) && !value.includes(' | ');
}

export function updateTickets(markdown, results, checkedDate) {
  if (!parseDate(checkedDate)) throw new Error('Invalid verification date');
  const found = collectTickets(markdown);
  // Keep the actual line endings and every untouched character, including EOF whitespace.
  const parts = markdown.split(/(\r?\n)/);
  for (const { id, index } of found.tickets) {
    if (!results.has(id)) continue;
    const facts = results.get(id);
    if (!safeFact(facts.status) || (facts.owner !== null && !safeFact(facts.owner))) throw new Error(`Invalid facts for ${id}`);
    const fields = parts[index * 2].split(' | ');
    for (const [key, value] of [['ticket-status', facts.status], ['ticket-owner', facts.owner], ['ticket-checked', checkedDate]]) {
      const position = fields.findIndex((field, i) => i > 0 && field.slice(0, field.indexOf(':')).trim() === key);
      if (value === null) { if (position >= 0) fields.splice(position, 1); }
      else if (position >= 0) {
        // Avoid rewriting whitespace when the existing value is already correct.
        if (fields[position].slice(fields[position].indexOf(':') + 1).trim() !== value) fields[position] = `${key}: ${value}`;
      } else fields.push(`${key}: ${value}`);
    }
    parts[index * 2] = fields.join(' | ');
  }
  return { markdown: parts.join(''), errors: found.errors };
}
