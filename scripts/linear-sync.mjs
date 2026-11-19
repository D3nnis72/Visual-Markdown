#!/usr/bin/env node
import { parseArgs } from 'node:util';
import path from 'node:path';
import { loadConfig, defaultConfig } from '../src/linear/config.js';
import { acquireLock, syncTargets } from '../src/linear/sync.js';
import { rotateLogs } from '../src/linear/service.js';

let release;
let configured = false;
try {
  const { values } = parseArgs({ options: { config: { type: 'string', default: defaultConfig }, 'dry-run': { type: 'boolean' }, help: { type: 'boolean' }, service: { type: 'boolean' } } });
  if (values.help) {
    console.log(`Usage: npm run linear-sync -- [--config /absolute/config.json] [--dry-run]
Config (private file, 0600, in a private directory, 0700):
{"targets":["/absolute/project-folder"],"keyFile":"/absolute/private/linear-api-key"}
Only steps with a Linear ticket link and ticket-sync: true are refreshed.
Store the API key in keyFile (0600). An interactive run also accepts LINEAR_API_KEY.
Default config: ${defaultConfig}
--dry-run fetches ticket data without modifying Markdown files.`);
  } else {
    if (values.service) await rotateLogs();
    const { config, apiKey } = await loadConfig(values.config, { allowEnvironment: !values.service });
    configured = true;
    release = await acquireLock(path.dirname(values.config));
    const result = await syncTargets(config, { apiKey, dryRun: values['dry-run'] });
    console.log(`${new Date().toISOString()} ${result.dryRun ? 'dry-run: ' : ''}${result.checked} ticket(s) checked, ${result.changed} file(s) ${result.dryRun ? 'would change' : 'changed'}, ${result.unchanged} unchanged, ${result.errors.length} error(s)`);
    for (const error of result.errors) console.error(`${error.id ?? error.file ?? 'steps'}${error.line ? `:${error.line}` : ''}: ${error.message}`);
    process.exitCode = result.errors.length ? 1 : 0;
  }
} catch (error) {
  console.error(error.code ? `Sync failed (${error.code})` : error.message);
  process.exitCode = configured ? 1 : 2;
} finally { await release?.(); }
