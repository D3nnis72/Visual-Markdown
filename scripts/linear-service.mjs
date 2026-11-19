#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { manageService } from '../src/linear/service.js';
import { defaultConfig, requireNode } from '../src/linear/config.js';

try {
  requireNode();
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { config: { type: 'string', default: defaultConfig }, help: { type: 'boolean' } } });
  if (values.help) console.log('Usage: npm run linear-service -- install|uninstall [--config /absolute/config.json]\nInstalls a macOS launch agent that syncs opted-in tickets immediately and every 300 seconds.\nPrepare a private config and key file first; see npm run linear-sync -- --help.\nUninstall leaves Markdown, configuration and credentials intact.');
  else {
    if (positionals.length !== 1) throw new Error('Expected install or uninstall');
    const file = await manageService(positionals[0], { config: values.config });
    console.log(`${positionals[0]}: ${file}`);
  }
} catch (error) { console.error(error.code ? `Service operation failed (${error.code})` : error.message); process.exitCode = 2; }
