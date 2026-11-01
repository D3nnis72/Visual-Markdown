import { STATES, FIELDS } from './schema.js';
import { t } from '../labels.js';

export function parseSteps(body, firstLine, lang) {
  const steps = [];
  const errors = [];
  body.split(/\r?\n/).forEach((text, index) => {
    const line = firstLine + index;
    const error = (key, vars) => errors.push({ line, message: t(lang, key, vars) });
    if (!text.trim()) return;
    if (/^\s+- \[/.test(text)) { error('errNested'); return; }
    const [head, ...fields] = text.split(' | ');
    const match = /^- \[([x~! ])\] ([a-z0-9][a-z0-9-]*):\s+(.+)$/i.exec(head);
    if (!match || !Object.hasOwn(STATES, match[1])) { error('errMalformed'); return; }
    const step = {
      id: match[2], state: STATES[match[1]], label: match[3].trim(), after: [],
      waitingFor: null, who: null, doneWhen: null, since: null, line,
    };
    for (const field of fields) {
      const colon = field.indexOf(':');
      const name = (colon < 0 ? field : field.slice(0, colon)).trim();
      if (colon < 0 || !Object.hasOwn(FIELDS, name)) { error('errField', { field: name }); continue; }
      const value = field.slice(colon + 1).trim();
      step[FIELDS[name]] = name === 'nach' ? value.split(',').map(id => id.trim()).filter(Boolean) : value;
    }
    steps.push(step);
  });
  return { steps, errors };
}
