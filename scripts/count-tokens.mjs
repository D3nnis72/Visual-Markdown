import { readFile } from 'node:fs/promises';
import { encode } from 'gpt-tokenizer/encoding/o200k_base';
const files = process.argv.slice(2);
if (!files.length) throw new Error('Usage: node scripts/count-tokens.mjs <file.md> [...]');
for (const file of files) console.log(`${encode(await readFile(file, 'utf8')).length}\t${file}`);
