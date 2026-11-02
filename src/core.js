import { readVisual } from './frontmatter.js';
import { renderBand } from './band.js';
import { parseSteps } from './steps/parse.js';
import { validateSteps, computeSteps } from './steps/compute.js';
import { renderSteps } from './steps/render.js';
import { renderError } from './meta.js';
import { transformChart } from './chart/render.js';
import { renderSection, sectionIds } from './sections.js';
import { parseBadges, isTableSeparator, isTableRow, renderTableRow } from './badges.js';
import { renderCard } from './cards.js';

export function transform(markdown, { today = new Date() } = {}) {
  const { visual, endLine } = readVisual(markdown);
  const lang = visual?.lang === 'en' ? 'en' : 'de';
  const band = renderBand(visual, today, lang);
  const lines = markdown.split(/\r?\n/);
  const firstContent = lines.findIndex((line, i) => i > endLine && line.trim());
  const bandAfter = firstContent >= 0 && /^# /.test(lines[firstContent]) ? firstContent : endLine;
  const sections = sectionIds(lines);
  const output = [];
  let changed = Boolean(band);
  let fence = null;
  let section = null;
  let card = null;
  const badges = parseBadges(visual?.badges);
  let tableBody = false;
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
      const kind = open && !line.startsWith(' ') ? open[2].trim() : null;
      if (kind === 'steps' || kind === 'chart') {
        let end = i + 1;
        while (end < lines.length) {
          const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(lines[end]);
          if (close && close[1][0] === open[1][0] && close[1].length >= open[1].length) break;
          end++;
        }
        if (kind === 'chart') {
          const chart = transformChart(lines, i, end, lang);
          output.push(...(chart.errors ? ['', renderError(chart.errors, lang, 'chart'), ''] : ['', ...chart.output]));
          changed = true;
          i = end;
          continue;
        }
        let html;
        try {
          const { steps, errors } = parseSteps(lines.slice(i + 1, end).join('\n'), i + 2, lang);
          errors.push(...validateSteps(steps, lang));
          html = errors.length ? renderError(errors, lang) : renderSteps(steps, computeSteps(steps), lang, { idPrefix: `vm-steps-${i + 1}`, today, sections });
        } catch (error) {
          html = renderError([{ line: i + 2, message: String(error.message ?? error) }], lang);
        }
        output.push('', html, '');
        changed = true;
        i = end;
      } else if (badges.size && tableBody && isTableRow(line)) {
        output.push(renderTableRow(line, badges));
        changed = true;
      } else if (badges.size && isTableSeparator(line) && isTableRow(lines[i - 1] ?? '')) {
        output.push(line);
        tableBody = true;
      } else if (!open && (card = renderCard(lines, i))) {
        output.push(...card.output);
        changed = true;
        i = card.end;
      } else if (!open && (section = renderSection(line, lang, today))) {
        output.push(...section);
        changed = true;
      } else {
        output.push(line);
        if (open) fence = { char: open[1][0], length: open[1].length };
      }
    }
    if (!isTableRow(line)) tableBody = false;
    if (band && i === bandAfter) insertBand();
  }
  return changed ? output.join('\n') : markdown;
}
