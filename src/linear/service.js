import { mkdir, writeFile, unlink, chmod, lstat, truncate } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadConfig, defaultConfig } from './config.js';
import { noSymlinks } from './sync.js';

export const serviceLabel = 'de.visual-markdown.linear-sync';
export const logDirectory = path.join(os.homedir(), 'Library', 'Logs', 'visual-markdown');
const xml = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export function servicePlist({ node, cli, config, logs }) {
  const args = [node, cli, '--config', config, '--service'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${serviceLabel}</string>
<key>ProgramArguments</key><array>${args.map(arg => `<string>${xml(arg)}</string>`).join('')}</array>
<key>RunAtLoad</key><true/><key>StartInterval</key><integer>300</integer>
<key>ProcessType</key><string>Background</string><key>Umask</key><integer>63</integer>
<key>StandardOutPath</key><string>${xml(path.join(logs, 'linear-sync.log'))}</string>
<key>StandardErrorPath</key><string>${xml(path.join(logs, 'linear-sync-error.log'))}</string>
</dict></plist>\n`;
}

export async function rotateLogs(logs = logDirectory) {
  for (const name of ['linear-sync.log', 'linear-sync-error.log']) {
    const file = path.join(logs, name);
    try {
      const stat = await lstat(file);
      if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Unsafe service log');
      // launchd keeps its file descriptors open, so truncate in place instead of renaming.
      if (stat.size > 1024 * 1024) await truncate(file, 0);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

export async function manageService(action, { config = defaultConfig, home = os.homedir(), node = process.execPath,
  cli = fileURLToPath(new URL('../../scripts/linear-sync.mjs', import.meta.url)), platform = process.platform,
  uid = process.getuid?.(), run = (args => execFileSync('/bin/launchctl', args, { stdio: 'pipe' })) } = {}) {
  if (platform !== 'darwin') throw new Error('The service installer requires macOS; use linear-sync with your scheduler');
  const folder = path.join(home, 'Library', 'LaunchAgents');
  const plist = path.join(folder, `${serviceLabel}.plist`);
  const domain = `gui/${uid}`;
  if (action === 'uninstall') {
    try { await run(['bootout', `${domain}/${serviceLabel}`]); } catch (error) { if (error.status !== 3 && error.status !== 113) throw new Error('Cannot unload sync service'); }
    await unlink(plist).catch(error => { if (error.code !== 'ENOENT') throw error; });
    return plist;
  }
  if (action !== 'install') throw new Error('Expected install or uninstall');
  await loadConfig(config); // A service must work without an interactive environment key.
  const logs = path.join(home, 'Library', 'Logs', 'visual-markdown');
  await mkdir(folder, { recursive: true });
  await noSymlinks(folder);
  await mkdir(logs, { recursive: true, mode: 0o700 });
  await noSymlinks(logs);
  await chmod(logs, 0o700);
  for (const name of ['linear-sync.log', 'linear-sync-error.log']) {
    const file = path.join(logs, name);
    try { if ((await lstat(file)).isSymbolicLink()) throw new Error('Unsafe service log'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await writeFile(file, '', { flag: 'a', mode: 0o600 });
    await chmod(file, 0o600);
  }
  try { await run(['bootout', `${domain}/${serviceLabel}`]); } catch (error) { if (error.status !== 3 && error.status !== 113) throw new Error('Cannot unload previous sync service'); }
  try { if ((await lstat(plist)).isSymbolicLink()) throw new Error('Unsafe launch agent file'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeFile(plist, servicePlist({ node, cli, config, logs }), { mode: 0o600 });
  await chmod(plist, 0o600);
  try { await run(['bootstrap', domain, plist]); } catch { throw new Error('Cannot start sync service'); }
  return plist;
}
