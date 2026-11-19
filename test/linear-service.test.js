import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, realpath, writeFile, readFile, chmod, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { servicePlist, manageService, rotateLogs } from '../src/linear/service.js';
import { loadConfig } from '../src/linear/config.js';

async function fixture(t) {
  const folder = await realpath(await mkdtemp(path.join(os.tmpdir(), 'linear-service-')));
  t.after(() => rm(folder, { recursive: true, force: true }));
  await chmod(folder, 0o700);
  const key = path.join(folder, 'key');
  const config = path.join(folder, 'config.json');
  await writeFile(key, 'private', { mode: 0o600 });
  await writeFile(config, JSON.stringify({ targets: [folder], keyFile: key }), { mode: 0o600 });
  return { folder, key, config };
}

test('launch agent has escaped absolute arguments and interval, never credentials', () => {
  const xml = servicePlist({ node: '/a/node', cli: '/a/my cli.mjs', config: '/a/A&B<config>.json', logs: '/a/logs' });
  assert.match(xml, /<integer>300<\/integer>/);
  assert.match(xml, /<string>\/a\/my cli.mjs<\/string>/);
  assert.match(xml, /A&amp;B&lt;config&gt;/);
  assert.match(xml, /<key>RunAtLoad<\/key><true\/>/);
  assert.doesNotMatch(xml, /Authorization|LINEAR_API_KEY|private/);
});

test('configuration and key enforce private permissions; environment is interactive only', async t => {
  const { config, key } = await fixture(t);
  assert.equal((await loadConfig(config)).apiKey, 'private');
  await chmod(key, 0o644);
  await assert.rejects(loadConfig(config), /Private file/);
  assert.equal((await loadConfig(config, { allowEnvironment: true, env: { LINEAR_API_KEY: 'interactive' } })).apiKey, 'interactive');
  await chmod(key, 0o600);
  await chmod(config, 0o644);
  await assert.rejects(loadConfig(config), /Private file/);
});

test('service lifecycle uses launchctl and uninstalls only its own plist', async t => {
  const { folder, config, key } = await fixture(t);
  const calls = [];
  const options = { home: folder, config, platform: 'darwin', uid: 123, node: '/a/node', cli: '/a/my cli.mjs', run: args => calls.push(args) };
  const plist = await manageService('install', options);
  assert.equal((await stat(plist)).mode & 0o777, 0o600);
  assert.deepEqual(calls.map(args => args[0]), ['bootout', 'bootstrap']);
  assert.match(await readFile(plist, 'utf8'), /my cli.mjs/);
  await manageService('uninstall', options);
  await assert.rejects(readFile(plist), { code: 'ENOENT' });
  assert.equal(await readFile(key, 'utf8'), 'private');
  await readFile(config);
  await assert.rejects(manageService('install', { ...options, platform: 'linux' }), /macOS/);
});

test('service log is bounded while keeping its inode for launchd', async t => {
  const { folder } = await fixture(t);
  const file = path.join(folder, 'linear-sync.log');
  await writeFile(file, 'x'.repeat(1024 * 1024 + 1));
  const before = await stat(file);
  await rotateLogs(folder);
  const after = await stat(file);
  assert.equal(after.size, 0);
  assert.equal(after.ino, before.ino);
});
