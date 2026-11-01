import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSteps } from '../src/steps/parse.js';
import { validateSteps, computeSteps } from '../src/steps/compute.js';
const parse = body => parseSteps(body, 1, 'de').steps;

test('parses state, id, label and fields', () => {
  assert.deepEqual(parseSteps('- [!] sa: Startauswahl klären | waiting-for: Rückmeldung | owner: Accenture | since: 30. Oktober', 5, 'de'), {
    steps: [{ id: 'sa', state: 'waiting', label: 'Startauswahl klären', after: [], waitingFor: 'Rückmeldung', who: 'Accenture', doneWhen: null, since: '30. Oktober', next: null, description: null, thread: null, updated: null, line: 5 }], errors: [],
  });
});
test('splits after into ids', () => assert.deepEqual(parse('- [ ] c: C | after: a, b')[0].after, ['a', 'b']));
test('reports a malformed line with its file line', () => assert.equal(parseSteps('- [x] a: A\nkein schritt', 10, 'de').errors[0].line, 11));
test('reports an unknown field', () => assert.match(parseSteps('- [ ] a: A | farbe: rot', 1, 'de').errors[0].message, /farbe/));
test('reports indented sub-items', () => assert.match(parseSteps('- [ ] a: A\n  - [ ] b: B', 1, 'de').errors[0].message, /Unterpunkte/));
test('finds duplicate ids, unknown ids and cycles', () => {
  assert.deepEqual(validateSteps(parse('- [ ] a: A\n- [ ] a: B'), 'de'), [{ line: 2, message: 'Kürzel „a“ doppelt' }]);
  assert.deepEqual(validateSteps(parse('- [ ] a: A | after: zz'), 'de'), [{ line: 1, message: '„zz“ in after gibt es nicht' }]);
  assert.deepEqual(validateSteps(parse('- [ ] a: A | after: b\n- [ ] b: B | after: a'), 'de'), [{ line: 1, message: 'Zyklus über a, b' }]);
});
test('computes progress, now and waves', () => {
  assert.deepEqual(computeSteps(parse('- [x] a: A\n- [~] b: B | after: a\n- [!] c: C | waiting-for: X\n- [ ] d: D\n- [ ] e: E | after: b\n- [ ] f: F | after: c, e')), {
    done: 1, total: 6, now: ['d'], waves: [['b', 'c', 'd'], ['e'], ['f']],
  });
});
test('keeps an open step that waits out of now', () => assert.deepEqual(computeSteps(parse('- [ ] d: D | waiting-for: X')).now, []));

test('parses the next action and English field names independently of UI language', () => {
  const result = parseSteps('- [~] run: Run | owner: Team | next: Check sample | done-when: Checks pass | after: prep | since: Monday', 1, 'en');
  assert.deepEqual(result.errors, []);
  assert.equal(result.steps[0].next, 'Check sample');
  assert.equal(result.steps[0].who, 'Team');
  assert.deepEqual(result.steps[0].after, ['prep']);
});
test('still reads existing German fields', () => {
  const result = parseSteps('- [ ] b: B | nach: a | wer: Team | fertig wenn: geprüft | wartet auf: Antwort | seit: Montag', 1, 'de');
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.steps[0].after, ['a']);
  assert.equal(result.steps[0].waitingFor, 'Antwort');
});
test('reads indented text below a step as its description', () => {
  const result = parseSteps('- [ ] a: A | owner: Team\n  Was passiert und wozu.\n  Zweite Zeile mit `code`.\n- [ ] b: B', 1, 'de');
  assert.deepEqual(result.errors, []);
  assert.equal(result.steps[0].description, 'Was passiert und wozu. Zweite Zeile mit `code`.');
  assert.equal(result.steps[1].description, null);
});
test('reports indented text before the first step', () => assert.equal(parseSteps('  Beschreibung ohne Schritt\n- [ ] a: A', 4, 'de').errors[0].line, 4));
test('keeps the thread reference verbatim', () => {
  const result = parseSteps('- [~] a: A | owner: Agent | thread: [Thread: ER4 ausführen; ref=thread_abc-123]', 1, 'de');
  assert.deepEqual(result.errors, []);
  assert.equal(result.steps[0].thread, '[Thread: ER4 ausführen; ref=thread_abc-123]');
});
