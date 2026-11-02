import { t } from './labels.js';
import { escapeHtml } from './html.js';
import { idBadge, updatedBadge, copyButton } from './meta.js';

// "## Title {#id updated=2026-11-01}" keeps the id and date in the source line,
// so a grep over the headings gives agents a cheap overview of the document.
export const HEADING = /^(#{2,6})\s+(.*?)\s+\{#([a-z0-9][a-z0-9-]*)((?:\s+[a-z][a-z-]*=[^\s}]+)*)\s*\}\s*$/i;

export function renderSection(line, lang, today) {
  const match = HEADING.exec(line);
  if (!match) return null;
  const [, hashes, title, id, rest] = match;
  const attributes = Object.fromEntries([...rest.matchAll(/([a-z][a-z-]*)=([^\s}]+)/gi)].map(([, key, value]) => [key, value]));
  const meta = `<div class="vm-section-meta" id="vm-section-${escapeHtml(id)}">${idBadge(id, lang)}${updatedBadge(attributes.updated, lang, today)}${copyButton({ id, lang, className: 'vm-copy-section', label: t(lang, 'copyStep', { id }) })}</div>`;
  return [`${hashes} ${title}`, meta, ''];
}

/** Ids of all section headings outside code fences, so steps can link to the section with their id. */
export function sectionIds(lines) {
  const ids = new Set();
  let fence = null;
  for (const line of lines) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !line.slice(marker.index + marker[1].length).trim()) fence = null;
      continue;
    }
    const match = !fence && HEADING.exec(line);
    if (match) ids.add(match[3]);
  }
  return ids;
}
