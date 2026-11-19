/** Priorities from most to least urgent. A block that uses them is grouped by priority. */
export const PRIORITIES = ['P1', 'P2', 'P3'];
export const STATES = { x: 'done', '~': 'running', '!': 'waiting', ' ': 'open' };
export const FIELDS = {
  after: 'after', 'waiting-for': 'waitingFor', owner: 'who',
  'done-when': 'doneWhen', since: 'since', next: 'next', thread: 'thread', updated: 'updated',
  priority: 'priority', see: 'see', status: 'status',
  workflow: 'workflow', responsibility: 'responsibility', ticket: 'ticket',
  'ticket-status': 'ticketStatus', 'ticket-owner': 'ticketOwner',
  'ticket-sync': 'ticketSync', 'ticket-checked': 'ticketChecked',
};
// Existing documents remain readable while their source is migrated.
export const LEGACY_FIELDS = {
  nach: 'after', 'wartet auf': 'waitingFor', wer: 'who',
  'fertig wenn': 'doneWhen', seit: 'since',
};

/** Progress shapes are independent of ownership colours and external ticket status names. */
export const WORKFLOWS = {
  todo: { state: 'open', group: 'ready', label: 'Todo', shape: '<circle cx="8" cy="8" r="6.25"/>' },
  'in-progress': { state: 'running', group: 'running', label: 'In Progress', shape: '<circle cx="8" cy="8" r="6.25"/><path d="M8 8V4.25A3.75 3.75 0 0 1 11.75 8z" fill="currentColor" stroke="none"/>' },
  review: { state: 'running', group: 'review', label: 'In Review', shape: '<circle cx="8" cy="8" r="6.25"/><path d="M8 4.25A3.75 3.75 0 0 1 8 11.75z" fill="currentColor" stroke="none"/>' },
  backlog: { state: 'open', group: 'later', label: 'Backlog', shape: '<circle cx="8" cy="8" r="6.25" stroke-dasharray="1.5 1.77" stroke-linecap="butt"/>' },
  'on-hold': { state: 'waiting', group: 'waiting', label: 'On Hold', shape: '<circle cx="8" cy="8" r="6.25"/><path d="M8 8V4.25A3.75 3.75 0 1 1 4.25 8z" fill="currentColor" stroke="none"/>' },
  done: { state: 'done', group: 'done', label: 'Done', shape: '<circle cx="8" cy="8" r="7" fill="currentColor" stroke="none"/><path class="vm-status-mark" d="m5.2 8.2 1.9 1.9 3.7-3.9"/>' },
  canceled: { state: 'open', group: 'canceled', label: 'Canceled', terminal: true, shape: '<circle cx="8" cy="8" r="7" fill="currentColor" stroke="none"/><path class="vm-status-mark" d="m5.8 5.8 4.4 4.4M10.2 5.8l-4.4 4.4"/>' },
  duplicate: { state: 'open', group: 'duplicate', label: 'Duplicate', terminal: true, shape: '<circle cx="8" cy="8" r="7" fill="currentColor" stroke="none"/><path class="vm-status-mark" d="m5.4 8.7 3-3M7.6 10.9l3-3"/>' },
};
export const RESPONSIBILITIES = ['self', 'delegated', 'unassigned'];
export const ENUM_FIELDS = { workflow: Object.keys(WORKFLOWS), responsibility: RESPONSIBILITIES, ticketSync: ['true', 'false'] };
export const isDismissed = step => Boolean(WORKFLOWS[step.workflow]?.terminal);
export const groupKeys = Object.values(WORKFLOWS).map(value => value.group);
export const progressShapes = Object.fromEntries(Object.values(WORKFLOWS).map(value => [value.group, value.shape]));
export const progressLabels = Object.fromEntries(Object.values(WORKFLOWS).map(value => [value.group, value.label]));
