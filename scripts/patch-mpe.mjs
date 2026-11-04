// Patches the installed Markdown Preview Enhanced extension so that a link to another Markdown file behaves in
// "Previews Only" mode like opening the file from the Explorer: it opens the file's normal MPE tab and jumps to the
// anchor after `#`. Without the patch MPE opens a separate preview panel and drops every fragment except `#L42`.
// The jump itself happens in the preview: visual-markdown.js scrolls to the element with that id.
// Idempotent; run again after every MPE update (install.sh does that).
import { readFile, writeFile, readdir, copyFile, access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

const MARKER = '/*visual-markdown:link-patch*/';
// Minified names change between MPE versions, so the pattern captures them instead of naming them.
const PATTERN = /if\((\w+)===(\w+)\.PreviewsOnly&&(\w+)\((\w+)\)\)\(await (\w+)\((\w+)\)\)\.initPreview\(\{sourceUri:\6,document:\4,cursorLine:(\w+),viewOptions:\{viewColumn:(\w+)\.ViewColumn\.Active,preserveFocus:!0\}\}\);else/;

export function patchSource(source) {
  if (source.includes(MARKER)) return { source, status: 'already' };
  const match = PATTERN.exec(source);
  if (!match) return { source, status: 'missing' };
  const [, mode, modes, isMarkdown, doc, provider, uri, line, vscode] = match;
  const replacement = `if(${mode}===${modes}.PreviewsOnly&&${isMarkdown}(${doc})){${MARKER}`
    + `let vmUri=${doc}.uri;`
    + `await ${vscode}.commands.executeCommand("vscode.openWith",vmUri,"markdown-preview-enhanced",${vscode}.ViewColumn.Active);`
    + `let vmMsg=${line}>=0?{command:"changeTextEditorSelection",line:${line},forced:!0}:${uri}.fragment?{command:"vmScrollToAnchor",id:${uri}.fragment}:null;`
    // The preview needs a moment to load and render; the preview script ignores repeats once the reader scrolls.
    + `if(vmMsg){let vmP=await ${provider}(${uri});[250,700,1500,3000].forEach(vmD=>setTimeout(()=>vmP.postMessageToPreview(vmUri,vmMsg),vmD))}`
    + '}else';
  return { source: source.replace(PATTERN, replacement), status: 'patched' };
}

async function extensionFiles() {
  const roots = ['.vscode', '.vscode-insiders', '.cursor', '.windsurf'].map(dir => join(homedir(), dir, 'extensions'));
  const files = [];
  for (const root of roots) {
    let entries;
    try { entries = await readdir(root); } catch { continue; }
    for (const entry of entries) {
      if (!entry.startsWith('shd101wyy.markdown-preview-enhanced-')) continue;
      const file = join(root, entry, 'out', 'native', 'extension.js');
      try { await access(file); files.push(file); } catch { /* other layout, skip */ }
    }
  }
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = process.argv.length > 2 ? process.argv.slice(2) : await extensionFiles();
  if (!files.length) console.log('MPE nicht gefunden, nichts gepatcht.');
  for (const file of files) {
    const { source, status } = patchSource(await readFile(file, 'utf8'));
    if (status === 'patched') {
      await copyFile(file, `${file}.visual-markdown.bak`);
      await writeFile(file, source);
      console.log(`MPE gepatcht: ${file}`);
    } else if (status === 'already') {
      console.log(`MPE schon gepatcht: ${file}`);
    } else {
      console.log(`MPE-Stelle nicht gefunden, Version geändert? ${file}`);
    }
  }
}
