import { inline } from '../html.js';
import { t } from '../labels.js';
import { readBlock, renderSays } from './common.js';

export const GALLERY_FIELDS = ['says', 'columns'];
export const GALLERY_COLUMNS = ['1', '2', '3', '4', '5', '6'];
// More images than columns wrap into further rows, so the block works as a grid as well.
// "![Hell](bilder/hell.png) Startseite im hellen Modus". Without text after the image, the alt text is the caption.
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*(.*)$/;

export function parseGallery(body, firstLine, lang) {
  const { fields, items, errors } = readBlock(body, firstLine, GALLERY_FIELDS, lang);
  if (fields.columns && !GALLERY_COLUMNS.includes(fields.columns)) {
    errors.push({ line: firstLine, message: t(lang, 'errValue', { field: 'columns', value: fields.columns, list: GALLERY_COLUMNS.join(', ') }) });
  }
  const images = [];
  for (const { text, line } of items) {
    const match = IMAGE.exec(text.trim());
    if (!match) errors.push({ line, message: t(lang, 'errGalleryLine') });
    else images.push({ alt: match[1], src: match[2], caption: match[3] || match[1] });
  }
  if (!images.length && !errors.length) errors.push({ line: firstLine, message: t(lang, 'errGalleryEmpty') });
  return { fields, images, errors };
}

/**
 * Images side by side with a caption under each. The images stay Markdown, so MPE resolves their
 * paths in the preview and in the PDF export exactly as for any other image.
 */
export function renderGallery({ fields, images }) {
  const columns = fields.columns ?? String(Math.min(images.length, 3));
  const output = [`<div class="vm-gallery" style="--vm-gallery-columns: ${columns}">${renderSays(fields.says, 'vm-chart-says')}<div class="vm-gallery-grid">`, ''];
  for (const image of images) {
    output.push(`<figure class="vm-gallery-item">`, '', `![${image.alt.replace(/[[\]]/g, '')}](${image.src})`, '');
    output.push(`${image.caption ? `<figcaption>${inline(image.caption)}</figcaption>` : ''}</figure>`, '');
  }
  output.push('</div></div>', '');
  return output;
}

export function transformGallery(lines, start, end, lang) {
  const gallery = parseGallery(lines.slice(start + 1, end).join('\n'), start + 2, lang);
  return gallery.errors.length ? { errors: gallery.errors } : { output: renderGallery(gallery) };
}
