import { readVisual } from './frontmatter.js';
import { t } from './labels.js';
import { STALE_DAYS, parseDate, formatDate, isStale } from './dates.js';
import { parseSteps } from './steps/parse.js';
import { validateSteps } from './steps/compute.js';
import { transformChart } from './chart/render.js';
import { HEADING } from './sections.js';
import { CARD_START, CARD_COLORS, CARD_ICONS } from './cards.js';
import { BADGE_COLORS } from './badges.js';
import { SHARE_VALUES } from './share.js';

const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

/**
 * Checks a Visual Markdown file with the same parsers the renderer uses.
 * Errors break the preview (error box instead of a block); warnings are dates and descriptions that are missing or old.
 */
export function checkMarkdown(markdown, { path = '', today = new Date() } = {}) {
  const { visual, endLine } = readVisual(markdown);
  const lang = visual?.lang === 'en' ? 'en' : 'de';
  const lines = markdown.split(/\r?\n/);
  const findings = [];
  const add = (level, line, key, vars) => findings.push({ level, line, message: t(lang, key, vars) });
  const lineOf = pattern => Math.max(1, lines.findIndex((line, i) => i <= endLine && pattern.test(line)) + 1);
  const dates = [];
  const checkDate = (value, line, what, stale = true) => {
    const date = parseDate(value);
    if (!date) { add('warning', line, 'checkBadDate', { value }); return; }
    dates.push(date);
    if (stale && isStale(date, today)) add('warning', line, 'checkStale', { what, days: STALE_DAYS, date: formatDate(date, lang) });
  };

  let uses = false;
  const sectionIds = new Map();
  let fence = null;
  for (let i = endLine + 1; i < lines.length; i++) {
    const line = lines[i];
    if (fence) {
      const close = FENCE.exec(line);
      if (close && !close[2].trim() && close[1][0] === fence.char && close[1].length >= fence.length) fence = null;
      continue;
    }
    const open = FENCE.exec(line);
    if (open) {
      const kind = line.startsWith(' ') ? null : open[2].trim();
      let end = i + 1;
      while (end < lines.length) {
        const close = FENCE.exec(lines[end]);
        if (close && !close[2].trim() && close[1][0] === open[1][0] && close[1].length >= open[1].length) break;
        end++;
      }
      if (kind === 'steps') {
        uses = true;
        const { steps, errors } = parseSteps(lines.slice(i + 1, end).join('\n'), i + 2, lang);
        errors.push(...validateSteps(steps, lang));
        for (const error of errors) findings.push({ level: 'error', line: error.line, message: error.message });
        for (const step of steps) {
          if (!step.updated) add('warning', step.line, 'checkStepDate', { id: step.id });
          else checkDate(step.updated, step.line, `\`${step.id}\``, step.state !== 'done');
          if (step.state !== 'done' && !step.description) add('warning', step.line, 'checkStepDescription', { id: step.id });
        }
      } else if (kind === 'chart') {
        uses = true;
        const chart = transformChart(lines, i, end, lang);
        for (const error of chart.errors ?? []) findings.push({ level: 'error', line: error.line, message: error.message });
        if (!lines.slice(i + 1, end).some(text => /^source:\s*\S/.test(text))) add('warning', i + 1, 'checkChartSource');
      }
      i = end;
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      uses = true;
      const id = heading[3];
      if (sectionIds.has(id)) add('warning', i + 1, 'checkSectionDuplicate', { id });
      sectionIds.set(id, i + 1);
      const updated = /\supdated=([^\s}]+)/.exec(heading[4])?.[1];
      if (!updated) add('warning', i + 1, 'checkSectionDate', { id });
      else checkDate(updated, i + 1, `\`${id}\``, false);
    }
    const card = CARD_START.exec(line);
    if (card) {
      uses = true;
      for (const word of card[1].trim().toLowerCase().split(/\s+/).filter(Boolean)) {
        if (!CARD_COLORS.includes(word) && !CARD_ICONS.includes(word)) add('warning', i + 1, 'checkCardWord', { word });
      }
    }
  }

  if (!visual) {
    if (uses) add('warning', 1, 'checkNoVisual');
  } else {
    const asOf = visual['as-of'] ?? visual.stand;
    for (const field of ['as-of', 'created']) {
      if (!visual[field] && !(field === 'as-of' && visual.stand)) add('warning', lineOf(/^visual:/), 'checkMissing', { field });
    }
    if (visual.created && !parseDate(visual.created)) add('warning', lineOf(/^ {2}created:/), 'checkBadDate', { value: visual.created });
    if (asOf) {
      const line = lineOf(/^ {2}(as-of|stand):/);
      const date = parseDate(asOf);
      if (!date) add('warning', line, 'checkBadDate', { value: asOf });
      else {
        if (isStale(date, today)) add('warning', line, 'checkStale', { what: '`as-of`', days: STALE_DAYS, date: formatDate(date, lang) });
        const newest = dates.reduce((max, d) => (d.timestamp > max.timestamp ? d : max), date);
        if (newest.timestamp > date.timestamp) add('warning', line, 'checkAsOfOld', { date: formatDate(newest, lang) });
      }
    }
    if (visual.share && !SHARE_VALUES.includes(visual.share.toLowerCase())) add('warning', lineOf(/^ {2}share:/), 'checkShareValue', { value: visual.share });
    for (const [, color] of String(visual.badges ?? '').matchAll(/:\s*([a-z]+)/gi)) {
      if (!BADGE_COLORS.includes(color)) add('warning', lineOf(/^ {2}badges:/), 'checkBadge', { color, list: BADGE_COLORS.join(', ') });
    }
  }
  if (/(^|\/)Customers\//.test(path) && (visual || uses) && !SHARE_VALUES.includes(String(visual?.share ?? '').toLowerCase())) {
    add('warning', 1, 'checkShare');
  }
  return findings.sort((a, b) => a.line - b.line);
}
