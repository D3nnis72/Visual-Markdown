/** Priorities from most to least urgent. A block that uses them is grouped by priority. */
export const PRIORITIES = ['P1', 'P2', 'P3'];
export const STATES = { x: 'done', '~': 'running', '!': 'waiting', ' ': 'open' };
export const FIELDS = {
  after: 'after', 'waiting-for': 'waitingFor', owner: 'who',
  'done-when': 'doneWhen', since: 'since', next: 'next', thread: 'thread', updated: 'updated',
  priority: 'priority', see: 'see', status: 'status',
  workflow: 'workflow', responsibility: 'responsibility', ticket: 'ticket',
  'ticket-status': 'ticketStatus', 'ticket-owner': 'ticketOwner',
};
// Existing documents remain readable while their source is migrated.
export const LEGACY_FIELDS = {
  nach: 'after', 'wartet auf': 'waitingFor', wer: 'who',
  'fertig wenn': 'doneWhen', seit: 'since',
};

/** Progress shapes are independent of ownership colours and external ticket status names. */
export const WORKFLOWS = {
  todo: { state: 'open', group: 'ready', label: 'Todo', shape: '<circle cx="8" cy="8" r="6.25"/>' },
  'in-progress': { state: 'running', group: 'running', label: 'In Progress', shape: '<circle cx="8" cy="8" r="6.25"/><path d="M8 4.25a3.75 3.75 0 0 1 0 7.5z" fill="currentColor" stroke="none"/>' },
  review: { state: 'running', group: 'review', label: 'In Review', shape: '<circle cx="8" cy="8" r="6.25"/><path d="m4.5 8 2.25 2.25L11.5 5.5"/><circle cx="12.5" cy="12.5" r="2" fill="currentColor" stroke="none"/>' },
  backlog: { state: 'open', group: 'later', label: 'Backlog', shape: '<circle cx="8" cy="8" r="6.25" stroke-dasharray="2.5 2.4"/>' },
  'on-hold': { state: 'waiting', group: 'waiting', label: 'On Hold', shape: '<circle cx="8" cy="8" r="6.25"/><path d="M6 5.5v5M10 5.5v5"/>' },
  done: { state: 'done', group: 'done', label: 'Done', shape: '<circle cx="8" cy="8" r="6.25"/><path d="m5.4 8.15 1.75 1.75 3.45-3.6"/>' },
  canceled: { state: 'open', group: 'canceled', label: 'Canceled', terminal: true, shape: '<circle cx="8" cy="8" r="6.25"/><path d="m5.5 5.5 5 5M10.5 5.5l-5 5"/>' },
  duplicate: { state: 'open', group: 'duplicate', label: 'Duplicate', terminal: true, shape: '<rect x="2" y="2" width="9" height="9" rx="2"/><path d="M6 13.5h5.5a2 2 0 0 0 2-2V6"/>' },
};
export const RESPONSIBILITIES = ['self', 'delegated', 'unassigned'];
export const ENUM_FIELDS = { workflow: Object.keys(WORKFLOWS), responsibility: RESPONSIBILITIES };
export const isDismissed = step => Boolean(WORKFLOWS[step.workflow]?.terminal);
export const groupKeys = Object.values(WORKFLOWS).map(value => value.group);
export const progressShapes = Object.fromEntries(Object.values(WORKFLOWS).map(value => [value.group, value.shape]));
export const progressLabels = Object.fromEntries(Object.values(WORKFLOWS).map(value => [value.group, value.label]));
