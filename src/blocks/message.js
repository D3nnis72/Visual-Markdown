import MarkdownIt from 'markdown-it';
import { escapeHtml } from '../html.js';

// Messages are self-contained: no raw HTML, images or document-level references.
const markdown = new MarkdownIt({ html: false, breaks: true }).disable('image');
const labels = {
  de: { title: 'Nachricht', to: 'An', rich: 'Nachricht kopieren', source: 'Markdown kopieren', copied: 'Kopiert', error: 'Kopieren fehlgeschlagen. Bitte den Text markieren und kopieren.', separator: 'Im message-Block fehlt die Trennzeile „---“ vor der Nachricht.', metadata: 'Erlaubt ist einmal „to: Empfänger“ vor der Trennzeile.', empty: 'Die Nachricht ist leer.' },
  en: { title: 'Message', to: 'To', rich: 'Copy message', source: 'Copy Markdown', copied: 'Copied', error: 'Copy failed. Please select and copy the text.', separator: 'The message block needs a “---” separator before the message.', metadata: 'Only one “to: recipient” is allowed before the separator.', empty: 'The message is empty.' },
};
const attr = value => escapeHtml(value).replace(/\r/g, '&#13;').replace(/\n/g, '&#10;');

export function transformMessage(lines, start, end, lang) {
  const text = labels[lang] || labels.de;
  const body = lines.slice(start + 1, end);
  const separator = body.findIndex(line => line.trim() === '---');
  if (separator < 0) return { errors: [{ line: start + 2, message: text.separator }] };
  let recipient = '';
  const errors = [];
  body.slice(0, separator).forEach((line, index) => {
    if (!line.trim()) return;
    const match = /^to:\s*(\S.*)$/.exec(line);
    if (!match || recipient) errors.push({ line: start + 2 + index, message: text.metadata });
    else recipient = match[1].trim();
  });
  const source = body.slice(separator + 1).join('\n');
  if (!source.trim()) errors.push({ line: start + separator + 3, message: text.empty });
  if (errors.length) return { errors };
  const title = recipient ? `${text.to} ${recipient}` : text.title;
  // One physical HTML line keeps MPE's outer Markdown parser out of the payload.
  const html = markdown.render(source).replace(/\n/g, '&#10;');
  return { output: [
    `<section class="vm-message" data-message-markdown="${attr(source)}" data-copy-success="${attr(text.copied)}" data-copy-error="${attr(text.error)}"><div class="vm-message-head"><span class="vm-message-title">${escapeHtml(title)}</span><div class="vm-message-actions"><button type="button" class="vm-message-copy" data-copy-format="rich">${text.rich}</button><button type="button" class="vm-message-copy vm-message-source" data-copy-format="markdown">${text.source}</button></div></div><div class="vm-message-body">${html}</div><div class="vm-message-status" role="status" aria-live="polite" aria-atomic="true"></div></section>`, '',
  ] };
}
