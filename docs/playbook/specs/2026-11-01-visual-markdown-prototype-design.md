# Visual Markdown: Prototyp mit Stand-Band und `steps`

**Size:** M      **Type:** frontend      **Plan tier:** Lite      **Depends on:** —      **Canvas:** [visual-markdown.md](../canvases/visual-markdown.md)

## Vision

Statusseiten und Canvasse zeigen den Stand eines Projekts heute als Prosa und Tabellen. Wer gerade dran ist, was als Nächstes möglich ist und worauf wir warten, muss man sich zusammenlesen, und der Satz „Stand: …“ veraltet unbemerkt. Visual Markdown soll das im Preview von Markdown Preview Enhanced (MPE) auf einen Blick zeigen, ohne dass die Datei für LLMs teurer wird.

Bevor wir die ganze erste Runde bauen, beweist ein kleiner Prototyp, ob sich das lohnt. Er baut eine echte Seite nach und vergleicht sie mit der heutigen. Ist sie nicht klar besser, hören wir auf. Das ist der Schritt `proto` im Canvas.

### Target

Eine Kopie der SLB-Statusseite `slb-project-status.md` liegt im Accenture-Repo unter `Docs/tmp/visual-markdown/`. In der Kopie steht der Stand unter `visual:` im Frontmatter statt im ersten Satz, und die Tabelle „Nächste Entscheidungen“ ist ein `steps`-Block mit denselben fünf Schritten. Was in der Spalte „Voraussetzung“ steht, wird je nach Inhalt zu `nach`, `wartet auf` oder `fertig wenn`, die Spalte „Zuständig“ zu `wer`. Den Zustand jedes Schritts nimmt die Kopie aus dem Text der Seite, etwa „Eine Rückmeldung liegt nicht vor“ als wartend. Der Rest der Seite bleibt wörtlich gleich, auch die relativen Links, die von `Docs/tmp/` aus ins Leere zeigen.

Im MPE-Preview zeigt die Kopie oben ein farbiges Band mit dem Stand-Datum, das bei einem alten Stand warnt. Der `steps`-Block erscheint als Liste mit Fortschritt, Zustand und Zuständigen je Schritt, darunter „Jetzt möglich“ und die parallelen Wellen. Ein fehlerhafter `steps`-Block zeigt einen Fehlerkasten mit der Zeilennummer in der Datei. Markdown-Dateien ohne `visual:` und ohne `steps` sehen aus wie vorher. Derselbe Stand erscheint im PDF-Export.

Dafür hat das Repo `Visual-Markdown` einen Kern als JavaScript-Modul ohne Abhängigkeiten, ein daraus gebautes `parser.js`, Stile für Band und `steps` in `style.less` und ein `install.sh`, das `parser.js` mitverlinkt. Format und Zustände von `steps` beschreibt das Canvas im Abschnitt `steps`.

## Approach

Die Regel: Die Datei beschreibt nur Inhalt, der Kern macht daraus zuerst eine Datenstruktur und dann HTML mit eigenen CSS-Klassen. So können später Check-Skript, PDF und ein eigener Viewer denselben Kern nutzen.

- **Kern**: JavaScript-Modul ohne Abhängigkeiten, Teil des Repos `Visual-Markdown`. Er liest das `visual:`-Frontmatter und die `steps`-Blöcke, prüft sie gegen das Schema von `steps`, berechnet Fortschritt, „Jetzt möglich“ und Wellen und erzeugt HTML. Er hängt nicht an MPE-Interna. Die Texte, die er ergänzt, gibt es auf Deutsch und Englisch, gewählt über `visual.lang` mit Deutsch als Standard.
- **Schema von `steps`**: Daten im Kern, kein eigenes Format. Es legt Zustände (`[x]`, `[~]`, `[!]`, `[ ]`), Kürzel und die Felder `nach`, `wartet auf`, `wer`, `fertig wenn`, `seit` fest. Ein unbekanntes Kürzel in `nach`, ein doppeltes Kürzel oder ein Zyklus machen den Block ungültig. `steps` wird in jeder Datei gerendert, auch ohne `visual:`, weil ein Codeblock dieses Typs sonst nirgends vorkommt.
- **Wellen**: Alle nicht fertigen Schritte (`[~]`, `[!]`, `[ ]`) werden nach ihren Abhängigkeiten in Stufen geteilt. Schritte derselben Stufe können parallel laufen. „Jetzt möglich“ sind nur die offenen Schritte (`[ ]`), deren Vorgänger fertig sind und die auf nichts warten.
- **`parser.js`**: Build-Ergebnis aus dem Kern, das mit ins Repo committet wird, damit Kollegen ohne Node auskommen. MPE führt `parser.js` in einer abgeschotteten QuickJS-Umgebung aus. Die Datei muss deshalb ein einziger in sich geschlossener Ausdruck sein und darf nichts nachladen. Sie hat keinen Dateizugriff, bekommt nur den Text der Datei und höchstens fünf Sekunden je Aufruf. Wirft ein Hook, gibt MPE stillschweigend den unveränderten Text zurück. Deshalb fängt der Kern Fehler je Block ab und rendert den Fehlerkasten selbst.
- **Stand-Band**: Kommt aus `visual.stand` und, falls vorhanden, `visual.status`. Ab wann ein Stand als alt gilt, ist eine einzige Konstante, die der Plan festlegt.
- **Stile**: Neue Regeln in `style.less` mit eigenen Klassen für Band, Liste und Fehlerkasten, hell und dunkel wie das übrige Theme. Die Statusfarben (`--m-ok-*`, `--m-warn-*`, `--m-bad-*`) gelten heute nur innerhalb von Mermaid-Diagrammen. Der Prototyp hebt sie auf die Ebene des ganzen Previews, damit Band und Liste sie nutzen. Das ist der erste Teil der Trennung in Farbwerte und Bausteinstile, die das Canvas vorsieht. Mermaid-Diagramme sehen danach aus wie vorher.

## Scope

**Where this lives**
- Renderer, Stile und Installation im Repo `/Users/dennis/Documents/Projects/Visual-Markdown`.
- Die Kopie der Statusseite im Accenture-Repo unter `Docs/tmp/visual-markdown/`. `check-frontmatter.mjs` erfasst `Docs/tmp/` nicht, `check-graph.mjs` liest dagegen alle Markdown-Dateien unter `Docs/`. Die Kopie bekommt deshalb die ID `tmp.visual-markdown.slb-project-status`, damit der Graph sie nicht mit der echten Seite verwechselt. `derivedFrom` bleibt wie im Original.

**What is already there**
- `style.less`, `config.js`, `install.sh` und `skills/mermaid-theme` im Repo. `install.sh` verlinkt heute nur `style.less` und `config.js` nach `~/.local/state/crossnote/` und sichert vorhandene Dateien als `.bak`.
- `~/.local/state/crossnote/parser.js` ist noch die Standarddatei von MPE und kein Link.
- MPE 0.8.40 unter `~/.vscode/extensions/shd101wyy.markdown-preview-enhanced-0.8.40/`. Im gebündelten crossnote ist belegt, dass die Hooks auch beim PDF-Export über Chrome laufen und dass `parser.js` in QuickJS ohne Dateizugriff läuft.
- Node 26 ist installiert. Es gibt noch kein `package.json` und keinen Bundler im Repo.
- Die Vorlage `Docs/human/slb-project-status.md` im Accenture-Repo hat Frontmatter mit `id`, `type` und `derivedFrom`, den Stand im ersten Satz und die Tabelle „Nächste Entscheidungen“ mit fünf Zeilen und den Spalten Nächster Schritt, Voraussetzung und Zuständig.

**Areas involved**
- MPE-Parser-Hooks, Theme, Installationsskript, eine Seite im Accenture-Repo als Testobjekt.

**Docs to read**
- Das Canvas, Abschnitte „Regeln für das Format“, `steps` und „Frontmatter“.
- `README.md` im Repo, für Farbvariablen, hell und dunkel und die Testhinweise zu `style.less` und `config.js`.
- MPE-Doku zu Parser-Hooks: https://shd101wyy.github.io/markdown-preview-enhanced/#/extend-parser
- `Docs/knowledge/workspace-documentation-rules.md` im Accenture-Repo, Zeile zu `Docs/tmp/` und Abschnitt „Versionierung“.

**Skills to use**
- `visual-interaction-verification` für den Blick auf Preview und PDF in hell und dunkel.

**Guardrails**
- Keine Kundendaten im Repo `Visual-Markdown`. Testfälle für den Kern sind ausgedacht.
- `config.js`, die Theme-Regeln für normales Markdown und der Skill `mermaid-theme` bleiben unverändert.
- `enableScriptExecution` bleibt aus.
- `install.sh` überschreibt kein vorhandenes `parser.js` ohne Sicherung.
- Die Kopie im Accenture-Repo ist ein Experiment, das nach dem Test gelöscht oder übernommen wird. Sie wird erst nach Dennis' Entscheidung committet, danach gilt die Regel aus „Versionierung“: direkt auf `main`.

## Not now
- Karten für Entscheidungen und Fragen, `chart`, Badges, Wasserzeichen und Callout-Stile.
- Check-Skript und Skill für Agents.
- Gemeinsame `steps`-Dateien mit `@import`.
- Graph-Ansicht, längste Kette und die übrigen Punkte unter „Später“ im Canvas.
- Die übrige Trennung von `style.less` über die Statusfarben hinaus.
- Umbenennung des GitHub-Repos und Einrichtung bei Kollegen.
- Umstellung der echten `slb-project-status.md`.

## Verification

**Tier:** Component

1. Nach `install.sh` und einem Neuladen des Fensters öffnet Dennis die Kopie im MPE-Preview. Oben steht das Band mit dem Stand. Der `steps`-Block zeigt die fünf Schritte mit Zustand und Zuständigen, „Jetzt möglich“ und die Wellen. Das passt in hell und dunkel.
2. Ein absichtlich falsches Kürzel in `nach:` zeigt den Fehlerkasten mit Zeilennummer. Nach dem Zurücksetzen ist die Liste wieder da.
3. Die echte Statusseite und ein Canvas mit Mermaid-Diagramm, aber ohne `steps`, sehen aus wie vor der Installation.
4. Der PDF-Export der Kopie zeigt Band und Liste.
5. Die Kopie braucht nicht mehr Tokens als die echte Seite, gezählt für beide mit dem o200k-Tokenizer aus dem npm-Paket `gpt-tokenizer`.
6. Zehn-Sekunden-Test: Dennis sieht in der Kopie schneller als in der echten Seite, was als Nächstes möglich ist und worauf wir warten. Das Ergebnis, weiter oder aufhören, steht danach im Canvas beim Schritt `proto`.

Belege: Screenshots des Previews in hell und dunkel, das PDF und die beiden Token-Zahlen.
