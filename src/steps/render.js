import { escapeHtml, inline } from '../html.js';
import { t } from '../labels.js';

export function renderSteps(steps, computed, lang) {
  const byId = new Map(steps.map(step => [step.id, step]));
  const labels = ids => ids.map(id => byId.get(id).label).join(', ');
  const icons = { done: '●', running: '◐', waiting: '⏸', open: '○' };
  const rows = steps.map(step => {
    const canStart = computed.now.includes(step.id);
    let note;
    if (step.state === 'done' || step.state === 'running') note = t(lang, step.state);
    else if (step.waitingFor) note = t(lang, 'waitingFor', { what: step.waitingFor });
    else if (step.state === 'waiting') note = t(lang, 'waiting');
    else if (canStart) note = t(lang, 'canStart');
    else note = t(lang, 'after', { list: labels(step.after.filter(id => byId.get(id).state !== 'done')) });
    if (step.since) note += ` (${t(lang, 'since', { when: step.since })})`;
    const title = step.doneWhen ? ` title="${escapeHtml(step.doneWhen)}"` : '';
    return `<li class="vm-step vm-${step.state}${canStart ? ' vm-can-start' : ''}"${title}><span class="vm-icon">${icons[step.state]}</span><span class="vm-label">${inline(step.label)}</span><span class="vm-who">${inline(step.who ?? '')}</span><span class="vm-note">${inline(note)}</span></li>`;
  }).join('');
  const percent = computed.total ? Math.round(100 * computed.done / computed.total) : 0;
  const head = `<div class="vm-steps-head"><span>${escapeHtml(t(lang, 'progress', computed))}</span><span class="vm-progress"><span style="width:${percent}%"></span></span></div>`;
  const now = `<div class="vm-now">${escapeHtml(t(lang, 'now'))}: ${inline(computed.now.length ? labels(computed.now) : t(lang, 'nothingNow'))}</div>`;
  const waves = computed.waves.length < 2 ? '' : `<div class="vm-waves">${escapeHtml(t(lang, 'waves'))}: ${computed.waves.map((wave, i) => `${i + 1}: ${inline(labels(wave))}`).join(' · ')}</div>`;
  return `<div class="vm-steps">${head}<ul class="vm-steps-list">${rows}</ul>${now}${waves}</div>`;
}

export function renderError(errors, lang) {
  return `<div class="vm-error">${escapeHtml(t(lang, 'errorAt', errors[0]))}${errors.length > 1 ? ` (+${errors.length - 1})` : ''}</div>`;
}
