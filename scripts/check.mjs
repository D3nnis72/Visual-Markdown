#!/usr/bin/env node
// Checks Visual Markdown files with the renderer's own parsers.
// Usage: node scripts/check.mjs [--strict] <file.md|folder> [...]
// Exit code 1 on errors, with --strict also on warnings.
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { checkMarkdown } from '../src/check.js';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const targets = args.filter(arg => arg !== '--strict');
if (!targets.length) {
  console.error('Usage: node scripts/check.mjs [--strict] <file.md|folder> [...]');
  process.exit(2);
}
async function* markdownFiles(target) {
  if ((await stat(target)).isDirectory()) {
    for (const entry of await readdir(target, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      yield* markdownFiles(path.join(target, entry.name));
    }
  } else if (target.endsWith('.md')) {
    yield target;
  }
}
let errors = 0;
let warnings = 0;
for (const target of targets) {
  for await (const file of markdownFiles(target)) {
    const findings = checkMarkdown(await readFile(file, 'utf8'), { path: path.resolve(file) });
    for (const finding of findings) {
      if (finding.level === 'error') errors++; else warnings++;
      console.log(`${file}:${finding.line}: ${finding.level}: ${finding.message}`);
    }
  }
}
console.log(`${errors} error(s), ${warnings} warning(s)`);
process.exit(errors || (strict && warnings) ? 1 : 0);
