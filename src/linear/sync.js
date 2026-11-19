import { lstat, readdir, readFile, open, rename, unlink, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { collectTickets, updateTickets } from './document.js';
import { fetchIssues } from './client.js';

/** Check every path component, including explicitly configured roots. */
export async function noSymlinks(file) {
  const absolute = path.resolve(file);
  let current = path.parse(absolute).root;
  for (const component of absolute.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, component);
    if ((await lstat(current)).isSymbolicLink()) throw new Error(`Symlink excluded: ${file}`);
  }
  return lstat(absolute);
}

async function discover(targets, errors) {
  const files = new Set();
  const visited = new Set();
  async function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    try {
      const stat = await noSymlinks(file);
      if (stat.isDirectory()) {
        for (const entry of await readdir(file, { withFileTypes: true })) {
          if (entry.name.startsWith('.') || ['node_modules', 'dist', 'build'].includes(entry.name) || entry.isSymbolicLink()) continue;
          if (!entry.isDirectory() && !(entry.isFile() && entry.name.endsWith('.md'))) continue;
          await visit(path.join(file, entry.name));
        }
      } else if (stat.isFile() && file.endsWith('.md')) files.add(file);
    } catch { errors.push({ file, message: 'Cannot read target or symlink excluded' }); }
  }
  for (const target of targets) await visit(target);
  return files;
}

export async function acquireLock(folder) {
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const file = path.join(folder, 'linear-sync.lock');
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const handle = await open(file, 'wx', 0o600);
      const identity = await handle.stat();
      await handle.writeFile(String(process.pid));
      await handle.close();
      return async () => {
        try { if ((await lstat(file)).ino === identity.ino) await unlink(file); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const stat = await lstat(file);
      if (stat.isSymbolicLink()) throw new Error('Unsafe lock file');
      const pid = Number(await readFile(file, 'utf8'));
      // A fresh or malformed lock may be in the process of being written.
      if (!Number.isInteger(pid) || pid <= 0) throw new Error('Another sync may be running');
      try { process.kill(pid, 0); throw new Error('Another sync is running'); }
      catch (check) { if (check.code !== 'ESRCH') throw check; }
      await unlink(file);
    }
  }
  throw new Error('Cannot acquire sync lock');
}

const sameFile = (a, b) => a.ino === b.ino && a.dev === b.dev && a.size === b.size && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs;

export async function syncTargets(config, { apiKey, dryRun = false, today = new Date(), fetchImpl, beforeWrite } = {}) {
  const errors = [];
  const snapshots = [];
  const ids = new Set();
  const files = await discover(config.targets, errors);
  for (const file of files) {
    try {
      const stat = await noSymlinks(file);
      const original = await readFile(file, 'utf8');
      const found = collectTickets(original);
      errors.push(...found.errors.map(error => ({ file, ...error })));
      if (!found.tickets.length) continue;
      found.tickets.forEach(ticket => ids.add(ticket.id));
      snapshots.push({ file, stat, original });
    } catch { errors.push({ file, message: 'Cannot read Markdown file' }); }
  }
  const fetched = ids.size ? await fetchIssues(ids, { apiKey, fetchImpl }) : { issues: new Map(), errors: [] };
  errors.push(...fetched.errors);
  const date = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  let changed = 0;
  let unchanged = 0;
  for (const { file, stat, original } of snapshots) {
    const next = updateTickets(original, fetched.issues, date).markdown;
    if (next === original) { unchanged++; continue; }
    if (dryRun) { changed++; continue; }
    const temporary = path.join(path.dirname(file), `.linear-sync-${randomUUID()}.tmp`);
    try {
      const handle = await open(temporary, 'wx', stat.mode & 0o777);
      try { await handle.chmod(stat.mode & 0o777); await handle.writeFile(next, 'utf8'); await handle.sync(); }
      finally { await handle.close(); }
      await beforeWrite?.(file);
      const current = await noSymlinks(file);
      if (!sameFile(stat, current) || await readFile(file, 'utf8') !== original) throw new Error('File changed during sync');
      await rename(temporary, file);
      changed++;
    } catch { errors.push({ file, message: 'Write skipped: file changed or cannot be safely replaced' }); }
    finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
  }
  return { checked: fetched.issues.size, changed, unchanged, errors, dryRun };
}
