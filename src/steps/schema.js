/** Priorities from most to least urgent. A block that uses them is grouped by priority. */
export const PRIORITIES = ['P1', 'P2', 'P3'];
export const STATES = { x: 'done', '~': 'running', '!': 'waiting', ' ': 'open' };
export const FIELDS = {
  after: 'after', 'waiting-for': 'waitingFor', owner: 'who',
  'done-when': 'doneWhen', since: 'since', next: 'next', thread: 'thread', updated: 'updated',
  priority: 'priority', see: 'see',
};
// Existing documents remain readable while their source is migrated.
export const LEGACY_FIELDS = {
  nach: 'after', 'wartet auf': 'waitingFor', wer: 'who',
  'fertig wenn': 'doneWhen', seit: 'since',
};
