import { readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { noSymlinks } from './sync.js';

export const configDirectory = path.join(os.homedir(), '.config', 'visual-markdown');
export const defaultConfig = path.join(configDirectory, 'linear-sync.json');

export function requireNode() {
  if (Number(process.versions.node.split('.')[0]) < 20) throw new Error('Node 20 or newer is required');
}

export async function privateFile(file, directory = false) {
  const stat = await noSymlinks(file);
  if ((directory ? !stat.isDirectory() : !stat.isFile()) || (stat.mode & 0o077) || (process.getuid && stat.uid !== process.getuid())) {
    throw new Error(`Private ${directory ? 'directory (0700)' : 'file (0600)'} required: ${file}`);
  }
}

export async function loadConfig(file = defaultConfig, { allowEnvironment = false, env = process.env } = {}) {
  requireNode();
  if (!path.isAbsolute(file)) throw new Error('Configuration path must be absolute');
  await privateFile(path.dirname(file), true);
  await privateFile(file);
  let config;
  try { config = JSON.parse(await readFile(file, 'utf8')); } catch { throw new Error('Cannot parse sync configuration'); }
  if (!config || typeof config !== 'object' || Object.keys(config).some(key => !['targets', 'keyFile'].includes(key))
    || !Array.isArray(config.targets) || !config.targets.length || config.targets.some(target => typeof target !== 'string' || !path.isAbsolute(target))) {
    throw new Error('Configuration requires absolute targets and an optional absolute keyFile');
  }
  for (const target of config.targets) await noSymlinks(target);
  let apiKey;
  if (allowEnvironment && env.LINEAR_API_KEY) apiKey = env.LINEAR_API_KEY.trim();
  else {
    if (typeof config.keyFile !== 'string' || !path.isAbsolute(config.keyFile)) throw new Error('Absolute keyFile required');
    await privateFile(path.dirname(config.keyFile), true);
    await privateFile(config.keyFile);
    apiKey = (await readFile(config.keyFile, 'utf8')).trim();
  }
  if (!apiKey || /\s/.test(apiKey)) throw new Error('Invalid Linear API key');
  return { config, apiKey };
}
