/** Read only the small, two-space-indented visual mapping. */
export function readVisual(markdown) {
  const lines = markdown.split(/\r?\n/);
  if (lines[0] !== '---') return { visual: null, endLine: -1 };
  const endLine = lines.findIndex((line, i) => i > 0 && line === '---');
  if (endLine < 0) return { visual: null, endLine: -1 };
  let visual = null;
  let inVisual = false;
  for (const line of lines.slice(1, endLine)) {
    if (line === 'visual:') { visual = {}; inVisual = true; continue; }
    if (line && !line.startsWith(' ')) inVisual = false;
    if (!inVisual) continue;
    const match = /^ {2}([^\s:][^:]*):\s*(.*?)\s*$/.exec(line);
    if (match) {
      const value = match[2].replace(/^(["'])(.*)\1$/, '$2');
      visual[match[1]] = value;
    }
  }
  return { visual, endLine };
}
