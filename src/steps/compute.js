import { WORKFLOWS, isDismissed } from './schema.js';
import { t } from '../labels.js';

export function validateSteps(steps, lang) {
  const errors = [];
  const byId = new Map();
  for (const step of steps) {
    if (byId.has(step.id)) errors.push({ line: step.line, message: t(lang, 'errDuplicate', { id: step.id }) });
    else byId.set(step.id, step);
  }
  for (const step of steps) {
    const workflow = WORKFLOWS[step.workflow];
    if (workflow && workflow.state !== step.state) errors.push({ line: step.line, message: t(lang, 'errWorkflowCheckbox', { workflow: step.workflow }) });
    if (workflow && step.waitingFor && step.workflow !== 'on-hold') errors.push({ line: step.line, message: t(lang, 'errWorkflowWaiting') });
    if (step.ticket && !/^\[[^\]]+\]\(https?:\/\/[^)\s]+\)$/.test(step.ticket)) errors.push({ line: step.line, message: t(lang, 'errTicketLink') });
    if ((step.ticketStatus || step.ticketOwner) && !step.ticket) errors.push({ line: step.line, message: t(lang, 'errTicketMissing') });
    for (const id of step.after) {
      if (!byId.has(id)) errors.push({ line: step.line, message: t(lang, 'errUnknown', { id }) });
    }
  }
  const visited = new Set();
  const path = [];
  const active = new Set();
  function visit(step) {
    if (active.has(step.id)) {
      const cycle = path.slice(path.indexOf(step.id));
      errors.push({ line: byId.get(cycle[0]).line, message: t(lang, 'errCycle', { list: cycle.join(', ') }) });
      return;
    }
    if (visited.has(step.id)) return;
    active.add(step.id);
    path.push(step.id);
    for (const id of step.after) if (byId.has(id)) visit(byId.get(id));
    path.pop();
    active.delete(step.id);
    visited.add(step.id);
  }
  for (const step of steps) visit(step);
  return errors;
}

/** Call only after validation: dependencies must exist and form a DAG. */
export function computeSteps(steps) {
  const byId = new Map(steps.map(step => [step.id, step]));
  const done = steps.filter(step => step.state === 'done').length;
  const now = steps.filter(step => step.state === 'open' && !isDismissed(step) && step.workflow !== 'backlog' && step.responsibility !== 'delegated' && !step.waitingFor
    && step.after.every(id => byId.get(id).state === 'done')).map(step => step.id);
  const levels = new Map();
  function level(step) {
    if (levels.has(step.id)) return levels.get(step.id);
    const predecessors = step.after.map(id => byId.get(id)).filter(s => s.state !== 'done');
    const result = predecessors.length ? 1 + Math.max(...predecessors.map(level)) : 0;
    levels.set(step.id, result);
    return result;
  }
  const waves = [];
  for (const step of steps) {
    if (step.state === 'done' || isDismissed(step)) continue;
    (waves[level(step)] ??= []).push(step.id);
  }
  return { done, total: steps.filter(step => !isDismissed(step)).length, now, waves };
}
