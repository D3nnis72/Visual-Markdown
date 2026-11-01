#!/usr/bin/env bash
# Verlinkt style.less, config.js und parser.js in das Crossnote-Verzeichnis von
# Markdown Preview Enhanced. Bestehende Dateien werden als .bak gesichert.
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

echo "Fertig. In VS Code: Developer: Reload Window ausführen."
