import { STATES, FIELDS, LEGACY_FIELDS, PRIORITIES, ENUM_FIELDS } from './schema.js';
import { t } from '../labels.js';

export function parseSteps(body, firstLine, lang) {
  const steps = [];
  const errors = [];
  body.split(/\r?\n/).forEach((text, index) => {
    const line = firstLine + index;
    const error = (key, vars) => errors.push({ line, message: t(lang, key, vars) });
    if (!text.trim()) return;
    if (/^\s+- \[/.test(text)) { error('errNested'); return; }
    const previous = steps[steps.length - 1];
    if (/^\s/.test(text) && previous) {
      previous.description = previous.description ? `${previous.description} ${text.trim()}` : text.trim();
      return;
    }
    const [head, ...fields] = text.split(' | ');
    const match = /^- \[([x~! ])\] ([a-z0-9][a-z0-9-]*):\s+(.+)$/i.exec(head);
    if (!match || !Object.hasOwn(STATES, match[1])) { error('errMalformed'); return; }
    const step = {
      id: match[2], state: STATES[match[1]], label: match[3].trim(), after: [],
      waitingFor: null, who: null, doneWhen: null, since: null, next: null, description: null, thread: null, updated: null, priority: null, see: null, status: null, line,
    };
    for (const field of fields) {
      const colon = field.indexOf(':');
      const name = (colon < 0 ? field : field.slice(0, colon)).trim();
      const property = Object.hasOwn(FIELDS, name) ? FIELDS[name]
        : Object.hasOwn(LEGACY_FIELDS, name) ? LEGACY_FIELDS[name] : null;
      if (colon < 0 || !property) { error('errField', { field: name }); continue; }
      const value = field.slice(colon + 1).trim();
      if (ENUM_FIELDS[property] && !ENUM_FIELDS[property].includes(value)) {
        error('errValue', { field: name, value, list: ENUM_FIELDS[property].join(', ') });
        continue;
      }
      if (property === 'priority') {
        if (!PRIORITIES.includes(value.toUpperCase())) error('errPriority', { value, list: PRIORITIES.join(', ') });
        else step.priority = value.toUpperCase();
        continue;
      }
      step[property] = property === 'after' ? value.split(',').map(id => id.trim()).filter(Boolean) : value;
    }
    steps.push(step);
  });
  return { steps, errors };
}
