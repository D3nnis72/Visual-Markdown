#!/usr/bin/env bash
# Verlinkt style.less, config.js und parser.js in das Crossnote-Verzeichnis von
# Markdown Preview Enhanced. Bestehende Dateien werden als .bak gesichert.
# Verlinkt außerdem die Agent-Skills aus skills/.
# visual-markdown.js wird kopiert, weil MPE Links auflöst und Preview-Skripte
# nur aus seinem eigenen Verzeichnis lädt.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${CROSSNOTE_DIR:-$HOME/.local/state/crossnote}"

mkdir -p "$DEST"
for f in style.less config.js parser.js; do
  if [ -e "$DEST/$f" ] && [ ! -L "$DEST/$f" ]; then
    mv "$DEST/$f" "$DEST/$f.bak"
    echo "Backup: $DEST/$f.bak"
  fi
  ln -sf "$SRC/$f" "$DEST/$f"
  echo "Verlinkt: $DEST/$f -> $SRC/$f"
done

cp "$SRC/visual-markdown.js" "$DEST/visual-markdown.js"
echo "Kopiert: $DEST/visual-markdown.js"
TAG='<script src="visual-markdown.js"></script>'
if ! grep -qF "$TAG" "$DEST/head.html" 2>/dev/null; then
  [ -e "$DEST/head.html" ] && cp "$DEST/head.html" "$DEST/head.html.bak" && echo "Backup: $DEST/head.html.bak"
  if [ -s "$DEST/head.html" ] && [ -n "$(tail -c 1 "$DEST/head.html")" ]; then echo >> "$DEST/head.html"; fi
  echo "$TAG" >> "$DEST/head.html"
  echo "Ergänzt: $DEST/head.html"
fi

# Links auf andere Markdown-Dateien springen in „Previews Only“ zum Anker. MPE-Updates überschreiben das, dann erneut ausführen.
if command -v node >/dev/null 2>&1; then node "$SRC/scripts/patch-mpe.mjs"; else echo "Node fehlt, MPE-Linkpatch übersprungen"; fi

# Agent-Skills: ~/.agents/skills gilt für Codex, Copilot und Gemini, Claude Code liest ~/.claude/skills.
SKILLS="${AGENTS_SKILLS_DIR:-$HOME/.agents/skills}"
mkdir -p "$SKILLS"
for skill in "$SRC"/skills/*/; do
  name="$(basename "$skill")"
  if [ -e "$SKILLS/$name" ] && [ ! -L "$SKILLS/$name" ]; then
    echo "Übersprungen: $SKILLS/$name ist kein Link, bitte von Hand prüfen"
  else
    ln -sfn "${skill%/}" "$SKILLS/$name"
    echo "Skill verlinkt: $SKILLS/$name"
  fi
  if [ -d "$HOME/.claude/skills" ] && [ ! -e "$HOME/.claude/skills/$name" ]; then
    ln -s "$SKILLS/$name" "$HOME/.claude/skills/$name"
    echo "Skill verlinkt: $HOME/.claude/skills/$name"
  fi
done

echo "Fertig. In VS Code: Developer: Reload Window ausführen."
echo "Der Kopierknopf braucht \"markdown-preview-enhanced.enablePreviewScripts\": true."
