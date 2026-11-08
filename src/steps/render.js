import { escapeHtml, inline } from '../html.js';
import { t } from '../labels.js';
import { svg, PRIORITY_SHAPES, AGENT_ICON, PERSON_ICON, THREAD_ICON, SINCE_ICON, CAPTION_ICONS, DEPENDENCY_ICON, SECTION_ICON, CHEVRON_ICON } from '../icons.js';
import { badge, updatedBadge, copyButton } from '../meta.js';

const ICON_SHAPES = {
  ready: '<circle cx="8" cy="8" r="6.25"/><path d="M6.75 5.75v4.5L10.25 8z" fill="currentColor"/>',
  running: '<circle cx="8" cy="8" r="6.25"/><path d="M8 4.25a3.75 3.75 0 0 1 0 7.5z" fill="currentColor" stroke="none"/>',
  later: '<circle cx="8" cy="8" r="6.25" stroke-dasharray="2.5 2.4"/>',
  waiting: '<circle cx="8" cy="8" r="6.25"/><path d="M8 5v3.25l2.1 1.3"/>',
  done: '<circle cx="8" cy="8" r="6.25"/><path d="m5.4 8.15 1.75 1.75 3.45-3.6"/>',
};
const icon = (key, className = 'vm-group-icon') => svg(`${className} vm-icon-${key}`, 16, ICON_SHAPES[key] ?? PRIORITY_SHAPES[key]);

// T3 Code thread mentions look like "[Thread: title; ref=…]"; other references only show the label.
const threadLabel = (reference, lang) => /^\[Thread:\s*([^;\]]+)/.exec(reference)?.[1].trim() || t(lang, 'thread');

/**
 * One compact row per step, like an issue list: status icon, id tag, title and a one-line
 * description. Everything else opens in native details, so the overview stays scannable.
 */
export function renderSteps(steps, computed, lang, { idPrefix = 'vm-steps', today = new Date(), sections = new Set() } = {}) {
  const byId = new Map(steps.map(step => [step.id, step]));
  const stateOf = step => step.state === 'open' && step.waitingFor ? 'waiting' : step.state;
  const groupOf = step => {
    const state = stateOf(step);
    if (state !== 'open') return state;
    return computed.now.includes(step.id) ? 'ready' : 'later';
  };
  // With priorities the list answers "what first": open steps by priority, done steps at the end.
  // The status icon in each row still shows whether a step runs, waits or can start.
  const prioritized = steps.some(step => step.priority);
  const listGroupOf = step => !prioritized ? groupOf(step)
    : step.state === 'done' ? 'done' : step.priority?.toLowerCase() ?? 'none';
  const groupKeys = prioritized ? ['p1', 'p2', 'p3', 'none', 'done'] : ['ready', 'running', 'later', 'waiting', 'done'];
  const groups = groupKeys
    .map(key => ({ key, steps: steps.filter(step => listGroupOf(step) === key) }))
    .filter(group => group.steps.length);
  const target = id => `${idPrefix}-${id}`;
  // A dependency takes the color of the step it points to.
  const dependency = id => `<a href="#${target(id)}" class="vm-dep vm-ref-${groupOf(byId.get(id)) === 'ready' ? 'can-start' : groupOf(byId.get(id)) === 'later' ? 'open' : groupOf(byId.get(id))}" title="${escapeHtml(byId.get(id).label)}">${DEPENDENCY_ICON}${escapeHtml(id)}</a>`;
  const field = (kind, label, content) => `<div class="vm-field vm-field-${kind}"><div class="vm-caption">${CAPTION_ICONS[kind]}${escapeHtml(t(lang, label))}</div><div class="vm-field-text">${content}</div></div>`;

  const renderRow = step => {
    const group = groupOf(step);
    const state = stateOf(step);
    const pending = step.after.filter(id => byId.get(id).state !== 'done');
    const since = step.since ? inline(t(lang, 'since', { when: step.since })) : '';
    const showNeed = state === 'waiting' && step.waitingFor;
    const need = showNeed ? `<div class="vm-need">${CAPTION_ICONS.needs}${inline(step.waitingFor)}${since ? `, ${since}` : ''}</div>` : '';
    const currentStatus = `<div class="vm-current-status"><span class="vm-current-status-label">${escapeHtml(t(lang, 'currentStatus'))}:</span> ${inline(step.status || t(lang, `group_${group}`))}</div>`;
    const summary = !step.status && step.description ? `<div class="vm-summary">${inline(step.description)}</div>` : '';
    const owner = step.who && (/^agent\b/i.test(step.who)
      ? badge('vm-owner vm-agent', AGENT_ICON, inline(step.who))
      : badge('vm-owner', PERSON_ICON, inline(step.who)));
    const meta = [
      ...pending.map(dependency),
      owner,
      step.thread ? badge('vm-thread', THREAD_ICON, escapeHtml(threadLabel(step.thread, lang)), step.thread) : '',
      step.since && !showNeed ? badge('vm-since', SINCE_ICON, inline(step.since), t(lang, 'since', { when: step.since })) : '',
      updatedBadge(step.updated, lang, today),
    ].join('');
    const body = [
      step.description ? field('description', 'description', inline(step.description)) : '',
      step.next && (state === 'running' || group === 'ready' || (prioritized && state !== 'done')) ? field('next', 'lineNext', inline(step.next)) : '',
      step.doneWhen && state !== 'done' ? field('goal', 'goal', inline(step.doneWhen)) : '',
      step.see ? field('see', 'see', inline(step.see)) : '',
      sections.has(step.id) ? `<a class="vm-section-link" href="#vm-section-${escapeHtml(step.id)}">${SECTION_ICON}${escapeHtml(t(lang, 'sectionLink'))}</a>` : '',
    ].join('');
    const copy = copyButton({ id: step.id, thread: step.thread, lang, label: t(lang, 'copyStep', { id: step.id }) });
    const head = `${icon(group, 'vm-status-icon')}<div class="vm-row-main"><div class="vm-label">${inline(step.label)}</div>${summary}${currentStatus}${need}</div><div class="vm-row-end"><div class="vm-meta">${meta}</div>${copy}`;
    const row = body
      ? `<details class="vm-row-details"${step.priority === 'P1' && state !== 'done' ? ' open' : ''}><summary class="vm-row">${head}<span class="vm-chevron">${CHEVRON_ICON}</span></div></summary><div class="vm-row-body">${body}</div></details>`
      : `<div class="vm-row">${head}<span class="vm-chevron"></span></div></div>`;
    return `<li id="${target(step.id)}" class="vm-step vm-${state}${group === 'ready' ? ' vm-can-start' : ''}">${row}</li>`;
  };
  const rows = groups.map(group =>
    `<section class="vm-group vm-group-${group.key}"><h3 class="vm-group-title">${icon(group.key)}${escapeHtml(t(lang, `group_${group.key}`))}<span class="vm-group-count">${group.steps.length}</span></h3><ul class="vm-steps-list">${group.steps.map(renderRow).join('')}</ul></section>`).join('');
  const percent = computed.total ? Math.round(100 * computed.done / computed.total) : 0;
  const head = `<div class="vm-steps-head"><span>${escapeHtml(t(lang, 'progress', computed))}</span><span class="vm-progress"><span style="width:${percent}%"></span></span></div>`;
  return `<div class="vm-steps">${head}${rows}</div>`;
}
