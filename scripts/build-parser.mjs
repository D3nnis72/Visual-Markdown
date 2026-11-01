import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
const result = await build({
  entryPoints: ['src/parser-entry.js'], bundle: true, format: 'iife',
  globalName: '__visualMarkdown', target: 'es2020', write: false,
});
await writeFile('parser.js', `(() => {\n// Generated from src/ by npm run build. Do not edit.\n${result.outputFiles[0].text}\nreturn __visualMarkdown.default;\n})()\n`);
