import test from 'node:test';
import assert from 'node:assert/strict';
import { collectTickets, updateTickets } from '../src/linear/document.js';
import { parseSteps } from '../src/steps/parse.js';
import { validateSteps } from '../src/steps/compute.js';
import { checkMarkdown } from '../src/check.js';
import { mkdtemp, writeFile, readFile, mkdir, symlink, rm, realpath, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { syncTargets, acquireLock } from '../src/linear/sync.js';

const row = '- [ ] verify: Nachtest | workflow: todo | owner: Dennis | ticket: [ASK-1](https://linear.app/lio/issue/ASK-1/title) | ticket-sync: true | ticket-status: In Review | ticket-owner: Nino | updated: 2026-11-01';
const wrap = text => '```steps\n' + text + '\n```\n';
const results = new Map([['ASK-1', { status: 'Done (Eng)', owner: 'Alex' }]]);

test('opted-in ticket facts update while local work and descriptions survive', () => {
  const text = wrap(row + '\n  Nachtest auf Staging steht aus.');
  const next = updateTickets(text, results, '2026-11-09').markdown;
  assert.equal(next, text.replace('ticket-status: In Review', 'ticket-status: Done (Eng)').replace('ticket-owner: Nino', 'ticket-owner: Alex').replace('updated: 2026-11-01', 'updated: 2026-11-01 | ticket-checked: 2026-11-09'));
  assert.equal(updateTickets(next, results, '2026-11-09').markdown, next);
  assert.match(updateTickets(next, results, '2026-11-10').markdown, /ticket-checked: 2026-11-10/);
});

test('unassigned clears the old ticket owner; failed and unmarked tickets stay intact', () => {
  const text = wrap(row);
  assert.doesNotMatch(updateTickets(text, new Map([['ASK-1', { status: 'Done', owner: null }]]), '2026-11-09').markdown, /ticket-owner:/);
  assert.equal(updateTickets(text, new Map(), '2026-11-09').markdown, text);
  for (const marker of ['', ' | ticket-sync: false']) {
    const unmarked = wrap(row.replace(' | ticket-sync: true', marker));
    assert.equal(collectTickets(unmarked).tickets.length, 0);
    assert.equal(updateTickets(unmarked, results, '2026-11-09').markdown, unmarked);
  }
});

test('preserves CRLF, frontmatter and nested examples, ignores unclosed blocks and foreign URLs', () => {
  const text = ('---\nvisual:\n  as-of: 2026-11-01\n---\n' + wrap(row)).replaceAll('\n', '\r\n');
  const next = updateTickets(text, results, '2026-11-09').markdown;
  assert.equal(next.replaceAll('\r\n', '').includes('\n'), false);
  assert.match(next, /as-of: 2026-11-01/);
  for (const invalid of ['````markdown\n' + wrap(row) + '````', '```steps\n' + row, wrap(row.replace('linear.app/', 'linear.app.evil/')), wrap(row + ' | ticket-sync: true'), wrap(row.replace('workflow: todo', 'workflow: magic'))]) {
    assert.equal(collectTickets(invalid).tickets.length, 0);
    assert.equal(updateTickets(invalid, results, '2026-11-09').markdown, invalid);
  }
});

test('schema validates sync and verification fields without treating ticket checks as local updates', () => {
  const valid = parseSteps(row + ' | ticket-checked: 2026-11-09', 1, 'de');
  assert.deepEqual(valid.errors, []);
  assert.deepEqual(validateSteps(valid.steps, 'de'), []);
  const document = '---\nvisual:\n  created: 2026-11-01\n  as-of: 2026-11-01\n---\n' + wrap(row + ' | ticket-checked: 2026-11-09\n  Nachtest steht aus.');
  assert.deepEqual(checkMarkdown(document, { today: new Date(2026, 10, 1) }), []);
  for (const text of ['- [ ] x: X | ticket-sync: true', row + ' | ticket-checked: 2026-02-30', row + ' | ticket-checked:', row.replace('ticket-sync: true', 'ticket-sync: yes')]) {
    const parsed = parseSteps(text, 1, 'de');
    assert.ok(parsed.errors.length + validateSteps(parsed.steps, 'de').length);
  }
});

test('rejects API values that could inject fields or lines', () => {
  assert.throws(() => updateTickets(wrap(row), new Map([['ASK-1', { status: 'Done | workflow: done', owner: 'A' }]]), '2026-11-09'));
});

async function fixture(t) {
  const folder = await realpath(await mkdtemp(path.join(os.tmpdir(), 'linear-sync-')));
  t.after(() => rm(folder, { recursive: true, force: true }));
  return folder;
}
const api = async (_url, options) => {
  const id = JSON.parse(options.body).variables.id;
  return { ok: true, json: async () => ({ data: { issue: { identifier: id, state: { name: 'Staging' }, assignee: { name: 'Alex' } } } }) };
};
test('filesystem sync deduplicates tickets, respects opt-in and leaves no-op files alone', async t => {
  const folder = await fixture(t);
  const file = path.join(folder, 'task.md');
  await writeFile(file, wrap(row), { mode: 0o640 });
  await writeFile(path.join(folder, 'other.md'), wrap(row));
  await mkdir(path.join(folder, '.hidden'));
  await writeFile(path.join(folder, '.hidden', 'task.md'), wrap(row));
  const outside = await fixture(t);
  await writeFile(path.join(outside, 'outside.md'), wrap(row));
  await symlink(outside, path.join(folder, 'linked'));
  let calls = 0;
  const options = { apiKey: 'private', today: new Date(2026, 10, 9), fetchImpl: async (...args) => { calls++; return api(...args); } };
  const result = await syncTargets({ targets: [folder, file] }, options);
  assert.equal(calls, 1);
  assert.equal(result.changed, 2);
  assert.deepEqual(result.errors, []);
  assert.equal((await stat(file)).mode & 0o777, 0o640);
  assert.equal(await readFile(path.join(outside, 'outside.md'), 'utf8'), wrap(row));
  const before = await stat(file);
  const next = await syncTargets({ targets: [folder] }, options);
  assert.equal(next.changed, 0);
  assert.equal(next.unchanged, 2);
  assert.equal((await stat(file)).mtimeMs, before.mtimeMs);
});

test('dry-run, concurrent edits and failed API requests preserve source evidence', async t => {
  const folder = await fixture(t);
  const file = path.join(folder, 'task.md');
  await writeFile(file, wrap(row));
  const options = { apiKey: 'private', fetchImpl: api };
  assert.equal((await syncTargets({ targets: [file] }, { ...options, dryRun: true })).changed, 1);
  assert.equal(await readFile(file, 'utf8'), wrap(row));
  const changed = await syncTargets({ targets: [file] }, { ...options, beforeWrite: async () => writeFile(file, wrap(row) + 'User edit\n') });
  assert.equal(changed.changed, 0);
  assert.equal(changed.errors.length, 1);
  assert.match(await readFile(file, 'utf8'), /User edit/);
  const original = await readFile(file, 'utf8');
  const offline = await syncTargets({ targets: [file] }, { ...options, fetchImpl: async () => { throw new Error('private'); } });
  assert.equal(offline.errors.length, 1);
  assert.equal(await readFile(file, 'utf8'), original);
});

test('partial failures update only successful tickets and no tickets make no requests', async t => {
  const folder = await fixture(t);
  const file = path.join(folder, 'task.md');
  await writeFile(file, wrap(row + '\n' + row.replace('verify:', 'other:').replaceAll('ASK-1', 'ASK-2')));
  const result = await syncTargets({ targets: [file] }, { apiKey: 'private', fetchImpl: async (url, options) => {
    if (JSON.parse(options.body).variables.id === 'ASK-2') return { ok: true, json: async () => ({ errors: [{}] }) };
    return api(url, options);
  } });
  assert.equal(result.changed, 1);
  assert.equal(result.errors.length, 1);
  assert.match(await readFile(file, 'utf8'), /ASK-1.*ticket-status: Staging/);
  assert.match(await readFile(file, 'utf8'), /ASK-2.*ticket-status: In Review/);
  await writeFile(file, 'No opted-in tickets');
  const none = await syncTargets({ targets: [file] }, { fetchImpl: () => assert.fail('unexpected fetch') });
  assert.equal(none.checked, 0);
});

test('global lock excludes concurrent runs and recovers a dead process', async t => {
  const folder = await fixture(t);
  const release = await acquireLock(folder);
  await assert.rejects(acquireLock(folder), /running/);
  await release();
  await writeFile(path.join(folder, 'linear-sync.lock'), '2147483647');
  const recovered = await acquireLock(folder);
  await recovered();
});
