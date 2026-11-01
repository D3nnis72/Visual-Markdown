#!/usr/bin/env bash
# Verlinkt style.less, config.js und parser.js in das Crossnote-Verzeichnis von
# Markdown Preview Enhanced. Bestehende Dateien werden als .bak gesichert.
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

echo "Fertig. In VS Code: Developer: Reload Window ausführen."
echo "Der Kopierknopf braucht \"markdown-preview-enhanced.enablePreviewScripts\": true."
