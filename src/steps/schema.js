export const STATES = { x: 'done', '~': 'running', '!': 'waiting', ' ': 'open' };
export const FIELDS = {
  after: 'after', 'waiting-for': 'waitingFor', owner: 'who',
  'done-when': 'doneWhen', since: 'since', next: 'next', thread: 'thread', updated: 'updated',
};
// Existing documents remain readable while their source is migrated.
export const LEGACY_FIELDS = {
  nach: 'after', 'wartet auf': 'waitingFor', wer: 'who',
  'fertig wenn': 'doneWhen', seit: 'since',
};
