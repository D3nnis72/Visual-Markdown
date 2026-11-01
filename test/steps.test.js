import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSteps } from '../src/steps/parse.js';
import { validateSteps, computeSteps } from '../src/steps/compute.js';
const parse = body => parseSteps(body, 1, 'de').steps;

test('parses state, id, label and fields', () => {
  assert.deepEqual(parseSteps('- [!] sa: Startauswahl klären | wartet auf: Rückmeldung | wer: Accenture | seit: 30. Oktober', 5, 'de'), {
    steps: [{ id: 'sa', state: 'waiting', label: 'Startauswahl klären', after: [], waitingFor: 'Rückmeldung', who: 'Accenture', doneWhen: null, since: '30. Oktober', line: 5 }], errors: [],
  });
});
test('splits nach into ids', () => assert.deepEqual(parse('- [ ] c: C | nach: a, b')[0].after, ['a', 'b']));
test('reports a malformed line with its file line', () => assert.equal(parseSteps('- [x] a: A\nkein schritt', 10, 'de').errors[0].line, 11));
test('reports an unknown field', () => assert.match(parseSteps('- [ ] a: A | farbe: rot', 1, 'de').errors[0].message, /farbe/));
test('reports indented sub-items', () => assert.match(parseSteps('- [ ] a: A\n  - [ ] b: B', 1, 'de').errors[0].message, /Unterpunkte/));
test('finds duplicate ids, unknown ids and cycles', () => {
  assert.deepEqual(validateSteps(parse('- [ ] a: A\n- [ ] a: B'), 'de'), [{ line: 2, message: 'Kürzel „a“ doppelt' }]);
  assert.deepEqual(validateSteps(parse('- [ ] a: A | nach: zz'), 'de'), [{ line: 1, message: '„zz“ in nach gibt es nicht' }]);
  assert.deepEqual(validateSteps(parse('- [ ] a: A | nach: b\n- [ ] b: B | nach: a'), 'de'), [{ line: 1, message: 'Zyklus über a, b' }]);
});
test('computes progress, now and waves', () => {
  assert.deepEqual(computeSteps(parse('- [x] a: A\n- [~] b: B | nach: a\n- [!] c: C | wartet auf: X\n- [ ] d: D\n- [ ] e: E | nach: b\n- [ ] f: F | nach: c, e')), {
    done: 1, total: 6, now: ['d'], waves: [['b', 'c', 'd'], ['e'], ['f']],
  });
});
test('keeps an open step that waits out of now', () => assert.deepEqual(computeSteps(parse('- [ ] d: D | wartet auf: X')).now, []));
