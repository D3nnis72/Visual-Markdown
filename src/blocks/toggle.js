import MarkdownIt from 'markdown-it';
import { escapeHtml } from '../html.js';

const markdown = new MarkdownIt({ html: false });
const labels = {
  de: { separator: 'Im toggle-Block fehlt die Trennzeile „---“ vor dem Inhalt.', metadata: 'Erlaubt sind einmal „title: Titel“ und optional „open: true“ oder „open: false“.', title: 'Der Toggle braucht einen Titel.', empty: 'Der Toggle-Inhalt ist leer.' },
  en: { separator: 'The toggle block needs a “---” separator before its content.', metadata: 'Use one “title: Title” and optionally “open: true” or “open: false”.', title: 'The toggle needs a title.', empty: 'The toggle content is empty.' },
};

export function transformToggle(lines, start, end, lang) {
  const text = labels[lang] || labels.de;
  const body = lines.slice(start + 1, end);
  const separator = body.findIndex(line => line.trim() === '---');
  if (separator < 0) return { errors: [{ line: start + 2, message: text.separator }] };
  const fields = {};
  const errors = [];
  body.slice(0, separator).forEach((line, index) => {
    if (!line.trim()) return;
    const match = /^(title|open):\s*(\S.*)$/.exec(line);
    if (!match || Object.hasOwn(fields, match[1]) || (match[1] === 'open' && !['true', 'false'].includes(match[2].trim()))) {
      errors.push({ line: start + 2 + index, message: text.metadata });
    } else fields[match[1]] = match[2].trim();
  });
  if (!fields.title) errors.push({ line: start + 2, message: text.title });
  const source = body.slice(separator + 1).join('\n');
  if (!source.trim()) errors.push({ line: start + separator + 3, message: text.empty });
  if (errors.length) return { errors };
  // Keep the rendered payload on one line, out of the outer MPE Markdown parser.
  const html = markdown.render(source).replace(/\n/g, '&#10;');
  return { output: [`<details class="vm-toggle"${fields.open === 'true' ? ' open' : ''}><summary>${escapeHtml(fields.title)}</summary><div class="vm-toggle-body">${html}</div></details>`, ''] };
}
