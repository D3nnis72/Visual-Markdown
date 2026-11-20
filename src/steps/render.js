import { WORKFLOWS, isDismissed, groupKeys as workflowGroups, progressShapes, progressLabels } from './schema.js';
import { escapeHtml, inline } from '../html.js';
import { t } from '../labels.js';
import { svg, PRIORITY_SHAPES, AGENT_ICON, PERSON_ICON, THREAD_ICON, SINCE_ICON, CAPTION_ICONS, DEPENDENCY_ICON, SECTION_ICON, CHEVRON_ICON } from '../icons.js';
import { badge, updatedBadge, copyButton } from '../meta.js';


const icon = (key, className = 'vm-group-icon') => svg(`${className} vm-icon-${key}`, 16, progressShapes[key] ?? PRIORITY_SHAPES[key]);
const sameText = (left, right) => left?.trim().replace(/\s+/g, ' ').toLowerCase() === right?.trim().replace(/\s+/g, ' ').toLowerCase();

// T3 Code thread mentions look like "[Thread: title; ref=…]"; other references only show the label.
const threadLabel = (reference, lang) => /^\[Thread:\s*([^;\]]+)/.exec(reference)?.[1].trim() || t(lang, 'thread');

/**
 * Stage of each step: 1 without predecessors, else one more than its latest predecessor.
 * Counted over all dependencies, done ones included, so a number never moves when a step is ticked off.
 */
export function stagesOf(steps, byId = new Map(steps.map(step => [step.id, step]))) {
  const stages = new Map();
  const stage = step => {
    if (!stages.has(step.id)) stages.set(step.id, step.after.length ? 1 + Math.max(...step.after.map(id => stage(byId.get(id)))) : 1);
    return stages.get(step.id);
  };
  steps.forEach(stage);
  return stages;
}

/** Stage groups: finished stages fold away, a stage with a step that can start now says so. */
function stageGroups(steps, stages, groupOf, lang) {
  const count = Math.max(...stages.values());
  return Array.from({ length: count }, (_, index) => index + 1).map(number => {
    const members = steps.filter(step => stages.get(step.id) === number);
    const open = members.filter(step => step.state !== 'done' && !isDismissed(step));
    const kind = !open.length ? 'finished' : open.some(step => !['later', 'backlog'].includes(groupOf(step))) ? 'now' : 'next';
    const parallel = open.length > 1 ? `<span class="vm-stage-hint">· ${escapeHtml(t(lang, 'stageParallel'))}</span>` : '';
    return {
      key: `stage vm-stage-${kind}`,
      steps: members,
      open: kind !== 'finished',
      mark: `<span class="vm-stage-no">${number}</span>`,
      title: `${escapeHtml(t(lang, `stage_${kind}`))}${parallel}`,
    };
  }).filter(group => group.steps.length);
}

/**
 * One compact row per step, like an issue list: status icon, id tag, title and a one-line
 * description. Everything else opens in native details, so the overview stays scannable.
 */
export function renderSteps(steps, computed, lang, { idPrefix = 'vm-steps', today = new Date(), sections = new Set() } = {}) {
  const byId = new Map(steps.map(step => [step.id, step]));
  const stateOf = step => step.state === 'open' && step.waitingFor ? 'waiting' : step.state;
  const groupOf = step => {
    if (step.workflow) return WORKFLOWS[step.workflow].group;
    const state = stateOf(step);
    if (state !== 'open') return state;
    return step.after.every(id => byId.get(id).state === 'done') ? 'ready' : 'later';
  };
  // With priorities the list answers "what first": open steps by priority, done steps at the end.
  // The status icon in each row still shows whether a step runs, waits or can start.
  const prioritized = steps.some(step => step.priority);
  // "Unassigned" only says something when other steps in the block have an owner.
  const anyOwner = steps.some(step => step.who);
  const listGroupOf = step => !prioritized ? groupOf(step)
    : step.state === 'done' ? 'done' : isDismissed(step) ? groupOf(step) : step.priority?.toLowerCase() ?? 'none';
  const groupKeys = prioritized ? ['p1', 'p2', 'p3', 'none', 'done', 'canceled', 'duplicate'] : workflowGroups;
  // With dependencies and no priorities the list answers "in which order": one group per stage.
  const staged = !prioritized && steps.some(step => step.after.length);
  const stages = staged ? stagesOf(steps, byId) : null;
  const groups = staged ? stageGroups(steps, stages, groupOf, lang)
    : groupKeys
      .map(key => ({ key, steps: steps.filter(step => listGroupOf(step) === key) }))
      .filter(group => group.steps.length);
  const target = id => `${idPrefix}-${id}`;
  // A dependency takes the color of the step it points to.
  const dependency = id => `<a href="#${target(id)}" class="vm-dep vm-ref-${groupOf(byId.get(id)) === 'ready' ? 'can-start' : groupOf(byId.get(id)) === 'later' ? 'open' : groupOf(byId.get(id))}" title="${escapeHtml(byId.get(id).label)}" data-responsibility="${escapeHtml(byId.get(id).responsibility ?? 'unassigned')}">${DEPENDENCY_ICON}${escapeHtml(id)}</a>`;
  const field = (kind, label, content) => `<div class="vm-field vm-field-${kind}"><div class="vm-caption">${CAPTION_ICONS[kind]}${escapeHtml(t(lang, label))}</div><div class="vm-field-text">${content}</div></div>`;

  const renderRow = step => {
    const group = groupOf(step);
    const state = stateOf(step);
    const responsibility = step.responsibility ?? 'unassigned';
    const closed = state === 'done' || isDismissed(step);
    const ownershipLabel = t(lang, responsibility === 'unassigned' && step.who ? 'responsibility_neutral' : `responsibility_${responsibility}`);
    const workflowLabel = progressLabels[group];
    const pending = step.after.filter(id => byId.get(id).state !== 'done');
    const since = step.since ? inline(t(lang, 'since', { when: step.since })) : '';
    const showNeed = state === 'waiting' && step.waitingFor;
    const need = showNeed ? `<div class="vm-need">${CAPTION_ICONS.needs}${inline(step.waitingFor)}${since ? `, ${since}` : ''}</div>` : '';
    const currentStatus = `<div class="vm-current-status"><span class="vm-current-status-label">${escapeHtml(t(lang, 'currentStatus'))}:</span> ${inline(step.status || progressLabels[group])}</div>`;
    const summary = !step.status && step.description ? `<div class="vm-summary">${inline(step.description)}</div>` : '';
    const ownerIcon = step.who && /^agent\b/i.test(step.who) ? AGENT_ICON : PERSON_ICON;
    const owner = !step.who && !anyOwner ? '' : badge(`vm-owner${step.who && /^agent\b/i.test(step.who) ? ' vm-agent' : ''}`, ownerIcon, step.who ? inline(step.who) : escapeHtml(t(lang, 'responsibility_unassigned')), ownershipLabel);
    const showTicketStatus = step.ticketStatus && !sameText(step.ticketStatus, workflowLabel);
    const showTicketOwner = step.ticketOwner && !sameText(step.ticketOwner, step.who);
    const ticket = step.ticket ? `<span class="vm-ticket">${inline(step.ticket)}${showTicketStatus ? ` · ${escapeHtml(step.ticketStatus)}` : ''}${showTicketOwner ? ` · ${escapeHtml(t(lang, 'ticketOwner', { who: step.ticketOwner }))}` : ''}</span>` : '';
    const meta = [
      ...pending.map(dependency),
      owner,
      // Grouped by progress, the group title already names it; grouped by priority, the row has to.
      prioritized ? `<span class="vm-badge vm-workflow-name">${escapeHtml(workflowLabel)}</span>` : '',
      ticket,
      step.thread ? badge('vm-thread', THREAD_ICON, escapeHtml(threadLabel(step.thread, lang)), step.thread) : '',
      step.since && !showNeed ? badge('vm-since', SINCE_ICON, inline(step.since), t(lang, 'since', { when: step.since })) : '',
      updatedBadge(step.updated, lang, today),
    ].join('');
    const body = [
      step.description ? field('description', 'description', inline(step.description)) : '',
      step.next && !closed ? field('next', 'lineNext', inline(step.next)) : '',
      step.doneWhen && !closed ? field('goal', 'goal', inline(step.doneWhen)) : '',
      step.see ? field('see', 'see', inline(step.see)) : '',
      sections.has(step.id) ? `<a class="vm-section-link" href="#vm-section-${escapeHtml(step.id)}">${SECTION_ICON}${escapeHtml(t(lang, 'sectionLink'))}</a>` : '',
    ].join('');
    const copy = copyButton({ id: step.id, thread: step.thread, lang, label: t(lang, 'copyStep', { id: step.id }) });
    const head = `<span class="vm-workflow" title="${escapeHtml(workflowLabel)} · ${escapeHtml(ownershipLabel)}">${icon(group, 'vm-status-icon')}</span><div class="vm-row-main"><div class="vm-label">${inline(step.label)}</div>${summary}${currentStatus}${need}</div><div class="vm-row-end"><div class="vm-meta">${meta}</div>${copy}`;
    const row = body
      ? `<details class="vm-row-details"${step.priority === 'P1' && !closed ? ' open' : ''}><summary class="vm-row">${head}<span class="vm-chevron">${CHEVRON_ICON}</span></div></summary><div class="vm-row-body">${body}</div></details>`
      : `<div class="vm-row">${head}<span class="vm-chevron"></span></div></div>`;
    return `<li id="${target(step.id)}" class="vm-step vm-${state} vm-responsibility-${responsibility}${isDismissed(step) ? ' vm-dismissed' : ''}${group === 'ready' ? ' vm-can-start' : ''}">${row}</li>`;
  };
  const rows = groups.map(group =>
    `<details class="vm-group vm-group-${group.key}"${group.open === false ? '' : ' open'}><summary class="vm-group-toggle"><h3 class="vm-group-title">${group.mark ?? icon(group.key)}${group.title ?? escapeHtml(progressLabels[group.key] ?? t(lang, `group_${group.key}`))}<span class="vm-group-count">${group.steps.length}</span><span class="vm-chevron vm-group-chevron">${CHEVRON_ICON}</span></h3></summary><ul class="vm-steps-list">${group.steps.map(renderRow).join('')}</ul></details>`).join('');
  const percent = computed.total ? Math.round(100 * computed.done / computed.total) : 0;
  const head = `<div class="vm-steps-head"><span>${escapeHtml(t(lang, 'progress', computed))}</span><span class="vm-progress"><span style="width:${percent}%"></span></span></div>`;
  return `<div class="vm-steps">${head}${rows}</div>`;
}
