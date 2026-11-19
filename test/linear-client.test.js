import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchIssues } from '../src/linear/client.js';

const response = (data, status = 200) => ({ ok: status === 200, status, json: async () => data });
test('queries each unique issue once using variables and read-only fields', async () => {
  const calls = [];
  const result = await fetchIssues(['ASK-1', 'ASK-1'], { apiKey: 'private', fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return response({ data: { issue: { identifier: 'ASK-1', state: { name: 'Staging' }, assignee: null } } });
  } });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.linear.app/graphql');
  assert.equal(calls[0].options.headers.Authorization, 'private');
  assert.deepEqual(JSON.parse(calls[0].options.body).variables, { id: 'ASK-1' });
  assert.doesNotMatch(JSON.parse(calls[0].options.body).query, /mutation/);
  assert.deepEqual(result.issues.get('ASK-1'), { status: 'Staging', owner: null });
});

test('GraphQL errors, null issues and invalid API facts cannot become ticket evidence', async () => {
  for (const data of [{ errors: [{ message: 'secret' }] }, { data: { issue: null } }, { data: { issue: { identifier: 'ASK-1', state: { name: 'Done | owner: Other' }, assignee: null } } }]) {
    const result = await fetchIssues(['ASK-1'], { apiKey: 'private', fetchImpl: async () => response(data) });
    assert.equal(result.issues.size, 0);
    assert.equal(result.errors.length, 1);
    assert.doesNotMatch(JSON.stringify(result.errors), /secret|private/);
  }
});

test('access and rate limits stop the run, network timeout is bounded', async () => {
  for (const status of [401, 403, 429]) {
    let calls = 0;
    const result = await fetchIssues(['ASK-1', 'ASK-2'], { apiKey: 'private', fetchImpl: async () => { calls++; return response({}, status); } });
    assert.equal(calls, 1);
    assert.equal(result.errors.length, 2);
  }
  const result = await fetchIssues(['ASK-1'], { apiKey: 'private', timeoutMs: 10, fetchImpl: async (_url, { signal }) => {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 1000);
      signal.addEventListener('abort', () => { clearTimeout(timer); reject(new Error('private')); });
    });
  } });
  assert.equal(result.issues.size, 0);
  assert.doesNotMatch(JSON.stringify(result.errors), /private/);
});
