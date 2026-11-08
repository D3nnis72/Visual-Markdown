import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSteps } from '../src/steps/parse.js';
import { computeSteps, validateSteps } from '../src/steps/compute.js';
import { transform } from '../src/core.js';
const parse = text => parseSteps(text, 1, 'de');
const render = text => transform('```steps\n' + text + '\n```');

test('accepts explicit progress and delegation independently of the status description', () => {
  const result = parse('- [~] fix: Fix | workflow: review | responsibility: delegated | owner: Nino | status: Prüft die Änderung | ticket: [ASK-1](https://linear.app/lio/issue/ASK-1) | ticket-status: In Review | ticket-owner: Nino');
  assert.deepEqual(result.errors, []);
  assert.equal(result.steps[0].workflow, 'review');
  assert.equal(result.steps[0].responsibility, 'delegated');
  assert.equal(result.steps[0].ticketStatus, 'In Review');
});

test('rejects unknown enums and conflicting checkbox states', () => {
  for (const text of ['- [ ] x: X | workflow: magic', '- [ ] x: X | responsibility: Nino', '- [x] x: X | workflow: review', '- [~] x: X | workflow: todo']) {
    const result = parse(text);
    assert.ok(result.errors.length + validateSteps(result.steps, 'de').length > 0, text);
  }
  const orphan = parse('- [ ] x: X | ticket-status: Done');
  assert.ok(validateSteps(orphan.steps, 'de').length > 0);
});

test('delegated todo and backlog are not personal start actions; old files remain compatible', () => {
  const { steps } = parse('- [ ] old: Old\n- [ ] assigned: Fix | workflow: todo | responsibility: delegated\n- [ ] planned: Later | workflow: backlog | responsibility: self\n- [ ] own: Work | workflow: todo | responsibility: self');
  assert.deepEqual(computeSteps(steps).now, ['old', 'own']);
});

test('canceled and duplicate steps neither complete dependencies nor count as completed work', () => {
  const { steps } = parse('- [ ] canceled: C | workflow: canceled\n- [ ] duplicate: D | workflow: duplicate\n- [ ] next: N | after: canceled\n- [x] done: Done | workflow: done');
  const result = computeSteps(steps);
  assert.equal(result.done, 1);
  assert.equal(result.total, 2);
  assert.deepEqual(result.now, []);
  assert.ok(!result.waves.flat().includes('canceled'));
  assert.ok(!result.waves.flat().includes('duplicate'));
});

test('a completed Linear fix does not complete a pending self-owned retest', () => {
  const text = '- [ ] verify: Nachtest | workflow: todo | responsibility: self | owner: Dennis | ticket: [ASK-1](https://linear.app/lio/issue/ASK-1) | ticket-status: Staging | ticket-owner: Nino';
  const result = computeSteps(parse(text).steps);
  assert.equal(result.done, 0);
  assert.deepEqual(result.now, ['verify']);
  const html = render(text);
  assert.match(html, /vm-responsibility-self/);
  assert.match(html, /Staging/);
  assert.match(html, /Nino/);
});

test('same review symbol uses ownership colours and names without visible ownership prefixes', () => {
  const html = render('- [~] own: Own | workflow: review | responsibility: self | owner: Dennis\n- [~] other: Other | workflow: review | responsibility: delegated | owner: Nino\n- [ ] unknown: Unknown');
  assert.equal((html.match(/vm-status-icon vm-icon-review/g) ?? []).length, 2);
  assert.match(html, /vm-responsibility-self/);
  assert.match(html, /vm-responsibility-delegated/);
  assert.match(html, /vm-responsibility-unassigned/);
  const owners = [...html.matchAll(/<span class="vm-badge vm-owner"[^>]*><svg[\s\S]*?<\/svg>(.*?)<\/span>/g)].map(match => match[1]);
  assert.deepEqual(owners, ['Nicht zugeordnet', 'Dennis', 'Nino']);
  assert.match(html, /In Review/);
});

test('ticket metadata shows only differences from the displayed workflow and owner', () => {
  const cases = [
    ['todo', 'Todo', 'Nico', 'Nico', ''],
    ['in-progress', 'In Progress', 'Nico', 'Nico', ''],
    ['review', 'In Review', 'Nico', 'Nico', ''],
    ['todo', 'TODO', 'Nico', 'nico', ''],
    ['todo', 'Staging', 'Dennis', 'Nino', ' · Staging · Ticket bei Nino'],
    ['todo', 'Todo', 'Dennis', 'Nino', ' · Ticket bei Nino'],
    ['todo', 'Staging', 'Dennis', 'Dennis', ' · Staging'],
    ['done', 'Done (Eng)', 'Nico', 'Nico', ' · Done (Eng)'],
  ];
  for (const [workflow, status, owner, ticketOwner, suffix] of cases) {
    const checkbox = workflow === 'done' ? 'x' : workflow === 'todo' ? ' ' : '~';
    const html = render(`- [${checkbox}] fix: Fix | workflow: ${workflow} | owner: ${owner} | status: Geprüfter Stand | ticket: [ASK-1](https://linear.app/lio/issue/ASK-1) | ticket-status: ${status} | ticket-owner: ${ticketOwner}`);
    const ticket = html.match(/<span class="vm-ticket">([\s\S]*?)<\/span>/)[1];
    assert.equal(ticket, `<a href="https://linear.app/lio/issue/ASK-1">ASK-1</a>${suffix}`, `${workflow}, ${status}, ${owner}, ${ticketOwner}`);
  }
});

test('implicit progress stays Todo regardless of responsibility', () => {
  const html = render('- [ ] own: Own | responsibility: self\n- [ ] other: Other | responsibility: delegated | owner: Nino\n- [ ] neutral: Neutral | responsibility: unassigned');
  assert.equal((html.match(/vm-status-icon vm-icon-ready/g) ?? []).length, 3);
});

test('explicit waiting reasons require the On Hold workflow', () => {
  for (const workflow of ['todo', 'backlog']) {
    const { steps } = parse(`- [ ] x: X | workflow: ${workflow} | waiting-for: Feedback`);
    assert.ok(validateSteps(steps, 'de').length > 0);
  }
  const { steps } = parse('- [!] x: X | workflow: on-hold | waiting-for: Feedback');
  assert.deepEqual(validateSteps(steps, 'de'), []);
});
