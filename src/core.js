import { readVisual } from './frontmatter.js';
import { renderBand } from './band.js';
import { parseSteps } from './steps/parse.js';
import { validateSteps, computeSteps } from './steps/compute.js';
import { renderSteps, renderError } from './steps/render.js';

export function transform(markdown, { today = new Date() } = {}) {
  const { visual, endLine } = readVisual(markdown);
  const lang = visual?.lang === 'en' ? 'en' : 'de';
  const band = renderBand(visual, today, lang);
  const lines = markdown.split(/\r?\n/);
  const firstContent = lines.findIndex((line, i) => i > endLine && line.trim());
  const bandAfter = firstContent >= 0 && /^# /.test(lines[firstContent]) ? firstContent : endLine;
  const output = [];
  let changed = Boolean(band);
  let fence = null;
  const insertBand = () => output.push('', band, '');
  if (band && bandAfter === -1) insertBand();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i <= endLine) {
      output.push(line);
    } else if (fence) {
      output.push(line);
      const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(line);
      if (close && close[1][0] === fence.char && close[1].length >= fence.length) fence = null;
    } else {
      const open = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
      if (open && !line.startsWith(' ') && open[2].trim() === 'steps') {
        let end = i + 1;
        while (end < lines.length) {
          const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(lines[end]);
          if (close && close[1][0] === open[1][0] && close[1].length >= open[1].length) break;
          end++;
        }
        let html;
        try {
          const { steps, errors } = parseSteps(lines.slice(i + 1, end).join('\n'), i + 2, lang);
          errors.push(...validateSteps(steps, lang));
          html = errors.length ? renderError(errors, lang) : renderSteps(steps, computeSteps(steps), lang);
        } catch (error) {
          html = renderError([{ line: i + 2, message: String(error.message ?? error) }], lang);
        }
        output.push('', html, '');
        changed = true;
        i = end;
      } else {
        output.push(line);
        if (open) fence = { char: open[1][0], length: open[1].length };
      }
    }
    if (band && i === bandAfter) insertBand();
  }
  return changed ? output.join('\n') : markdown;
}
