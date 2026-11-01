# Visual Markdown Prototyp Plan

**Tier:** Lite      **Goal:** Stand-Band und `steps` im MPE-Preview an einer Kopie der SLB-Statusseite, mit Token-Vergleich und Zehn-Sekunden-Test als Entscheidung über weiter oder aufhören.

Spec: [2026-11-01-visual-markdown-prototype-design.md](../specs/2026-11-01-visual-markdown-prototype-design.md). Die Namen dort gelten hier unverändert: Kern, Schema von `steps`, Wellen, `parser.js`, Stand-Band, Stile.

**Files** (Repo `/Users/dennis/Documents/Projects/Visual-Markdown`, wenn nicht anders angegeben)
- Create: `package.json`, `.gitignore` (`node_modules/`)
- Create: `src/labels.js`: deutsche und englische Texte des Renderers
- Create: `src/frontmatter.js`: liest `visual:` aus dem Frontmatter
- Create: `src/html.js`: Escaping und Inline-Format für Beschriftungen
- Create: `src/steps/schema.js`, `src/steps/parse.js`, `src/steps/compute.js`, `src/steps/render.js`: Schema, Einlesen, Prüfen und Berechnen, HTML
- Create: `src/band.js`: Stand-Band
- Create: `src/core.js`: `transform`, findet Blöcke und setzt das Band ein
- Create: `src/parser-entry.js`: einziger Adapter auf die MPE-Hooks
- Create: `scripts/build-parser.mjs`, `scripts/count-tokens.mjs`, `scripts/preview.mjs`
- Create: `parser.js`: Build-Ergebnis, wird committet
- Create: `test/frontmatter.test.js`, `test/steps.test.js`, `test/transform.test.js`, `test/parser-build.test.js`
- Modify: `style.less`: Statusfarben auf Preview-Ebene heben (Zeilen 187–192 und 207–212), neuer Abschnitt am Ende
- Modify: `install.sh`: `parser.js` mitverlinken
- Modify: `README.md`: Abschnitt zu `parser.js`
- Create (Accenture-Repo): `Docs/tmp/visual-markdown/slb-project-status.md`

Alle Testfälle im Repo `Visual-Markdown` sind ausgedacht. Kundendaten bleiben im Accenture-Repo und in `/tmp`.

### Task 1: Gerüst, Frontmatter und Texte

**Produces:**
- `readVisual(markdown: string): { visual: Record<string,string> | null, endLine: number }`. `endLine` ist der 0-basierte Index der schließenden `---`-Zeile, `-1` ohne Frontmatter. Gelesen werden nur die zwei Leerzeichen eingerückten `key: value`-Zeilen direkt unter `visual:` in Spalte 0. Anführungszeichen um Werte werden entfernt.
- `t(lang: 'de'|'en', key: string, vars?: object): string` in `src/labels.js`. Unbekannte Sprache fällt auf `de` zurück. Schlüssel und Texte:

| Schlüssel | de | en |
| --- | --- | --- |
| `progress` | `{done} von {total} fertig` | `{done} of {total} done` |
| `done` | `fertig` | `done` |
| `running` | `läuft` | `running` |
| `waiting` | `wartet` | `waiting` |
| `waitingFor` | `wartet auf {what}` | `waiting for {what}` |
| `canStart` | `kann starten` | `can start` |
| `after` | `nach {list}` | `after {list}` |
| `since` | `seit {when}` | `since {when}` |
| `now` | `Jetzt möglich` | `Now possible` |
| `nothingNow` | `gerade nichts` | `nothing right now` |
| `waves` | `Wellen` | `Waves` |
| `stand` | `Stand {date}` | `As of {date}` |
| `stale` | `älter als {days} Tage` | `older than {days} days` |
| `errorAt` | `Fehler in steps, Zeile {line}: {message}` | `Error in steps, line {line}: {message}` |
| `errMalformed` | `kein Schritt im Format „- [ ] kürzel: Text“` | `not a step in the form "- [ ] id: text"` |
| `errField` | `unbekanntes Feld „{field}“` | `unknown field "{field}"` |
| `errNested` | `Unterpunkte kommen erst später` | `sub-items are not supported yet` |
| `errDuplicate` | `Kürzel „{id}“ doppelt` | `duplicate id "{id}"` |
| `errUnknown` | `„{id}“ in nach gibt es nicht` | `"{id}" in nach does not exist` |
| `errCycle` | `Zyklus über {list}` | `cycle through {list}` |

- [ ] `package.json` anlegen: `"type": "module"`, `"private": true`, devDependencies `esbuild@^0.28.2`, `gpt-tokenizer@^4.1.0`, `markdown-it@^15.0.3`, `less@^4.9.1`, scripts `"build": "node scripts/build-parser.mjs"`, `"test": "node scripts/build-parser.mjs && node --test test/"`, `"tokens": "node scripts/count-tokens.mjs"`, `"preview": "node scripts/preview.mjs"`. `.gitignore` mit `node_modules/`. `npm install`.
- [ ] Failing Tests in `test/frontmatter.test.js` (`node:test`, `node:assert/strict`):
      `reads stand, status and lang under visual:` mit `"---\nid: x\nvisual:\n  status: Approved\n  stand: 2026-11-01\n  lang: en\n---\n# T\n"`, erwartet `{ status: 'Approved', stand: '2026-11-01', lang: 'en' }` und `endLine === 6`.
      `returns null visual without visual key` mit `"---\nid: x\n---\n"`, erwartet `visual === null`, `endLine === 2`.
      `returns endLine -1 without frontmatter` mit `"# T\n"`.
      `strips quotes from values` mit `stand: "2026-11-01"`.
- [ ] `node --test test/frontmatter.test.js`: FAIL, Modul fehlt
- [ ] `readVisual` in `src/frontmatter.js` und `t` in `src/labels.js` umsetzen
- [ ] `node --test test/frontmatter.test.js`: PASS
- [ ] Commit

### Task 2: Schema, Einlesen, Prüfen und Wellen von `steps`

**Produces:**
- `src/steps/schema.js`: `STATES = { x: 'done', '~': 'running', '!': 'waiting', ' ': 'open' }`, `FIELDS = { 'nach': 'after', 'wartet auf': 'waitingFor', 'wer': 'who', 'fertig wenn': 'doneWhen', 'seit': 'since' }`.
- `Step = { id, state, label, after: string[], waitingFor, who, doneWhen, since, line }`. Nicht gesetzte Felder sind `null`, `line` ist die Zeile in der Datei (1-basiert).
- `parseSteps(body: string, firstLine: number, lang): { steps: Step[], errors: { line: number, message: string }[] }`. Eine Zeile ist `- [s] kürzel: Text`, danach optional ` | feld: wert`, jeweils durch ` | ` getrennt. Kürzel passt auf `/^[a-z0-9][a-z0-9-]*$/i`. `nach` wird an Kommas geteilt und getrimmt. Leere Zeilen werden übersprungen. Eine eingerückte Zeile mit `- [` ergibt `errNested`, jede andere nicht passende Zeile `errMalformed`, ein Feld außerhalb von `FIELDS` `errField`.
- `validateSteps(steps, lang): { line, message }[]` mit `errDuplicate` (Zeile des zweiten Vorkommens), `errUnknown` (Zeile des Schritts mit dem Verweis) und `errCycle` (Zeile des ersten Schritts im Zyklus, Liste der Kürzel).
- `computeSteps(steps): { done: number, total: number, now: string[], waves: string[][] }`. `now` sind Schritte mit Zustand `open`, ohne `waitingFor` und mit lauter fertigen Vorgängern. `waves` teilt alle nicht fertigen Schritte in Stufen: Stufe 0 ohne nicht fertige Vorgänger, sonst 1 plus die höchste Stufe der nicht fertigen Vorgänger. Reihenfolge in jeder Stufe wie in der Datei.

- [ ] Failing Tests in `test/steps.test.js`:
      `parses state, id, label and fields`: `"- [!] sa: Startauswahl klären | wartet auf: Rückmeldung | wer: Accenture | seit: 30. Oktober"` mit `firstLine` 5 ergibt `{ id: 'sa', state: 'waiting', label: 'Startauswahl klären', after: [], waitingFor: 'Rückmeldung', who: 'Accenture', doneWhen: null, since: '30. Oktober', line: 5 }`.
      `splits nach into ids`: `nach: a, b` ergibt `['a', 'b']`.
      `reports a malformed line with its file line`: `"- [x] a: A\nkein schritt"` mit `firstLine` 10 ergibt einen Fehler mit `line === 11`.
      `reports an unknown field`: `"- [ ] a: A | farbe: rot"`, Meldung enthält `farbe`.
      `reports indented sub-items`: `"- [ ] a: A\n  - [ ] b: B"` ergibt `errNested`.
      `finds duplicate ids, unknown ids and cycles`: je ein Fall, `a` zweimal, `nach: zz`, `a nach b` und `b nach a`.
      `computes progress, now and waves`: Schritte `a [x]`, `b [~] nach a`, `c [!] wartet auf: X`, `d [ ]`, `e [ ] nach b`, `f [ ] nach c, e` ergeben `done 1`, `total 6`, `now ['d']`, `waves [['b','c','d'],['e'],['f']]`.
      `keeps an open step that waits out of now`: `d [ ] | wartet auf: X` allein ergibt `now []`.
- [ ] `node --test test/steps.test.js`: FAIL
- [ ] `parseSteps`, `validateSteps`, `computeSteps` umsetzen
- [ ] `node --test test/steps.test.js`: PASS
- [ ] Commit

### Task 3: HTML, Stand-Band und `transform`

**Produces:**
- `escapeHtml(s)` und `inline(s)` in `src/html.js`. `inline` escapt zuerst und wandelt dann `` `code` `` in `<code>` und `[text](url)` in `<a href="url">text</a>`.
- `renderSteps(steps, computed, lang): string`. Aufbau: `div.vm-steps` mit `div.vm-steps-head` (Text `progress` und `span.vm-progress > span` mit `style="width:NN%"`), `ul.vm-steps-list` mit je `li.vm-step.vm-<state>` aus `span.vm-icon` (● fertig, ◐ läuft, ⏸ wartet, ○ offen), `span.vm-label`, `span.vm-who` und `span.vm-note`. Die Notiz ist `done`, `running`, `waitingFor` (oder `waiting` ohne Wert), `canStart` (dann zusätzlich Klasse `vm-can-start`) oder `after` mit den Beschriftungen der nicht fertigen Vorgänger. `since` hängt in Klammern an. `doneWhen` steht als `title`-Attribut auf dem `li`. Darunter `div.vm-now` mit `now` und den Beschriftungen oder `nothingNow`, und nur bei mindestens zwei Wellen `div.vm-waves` mit `Wellen: 1: …, … · 2: …`.
- `renderError(errors, lang): string` als `div.vm-error` mit dem ersten Fehler über `errorAt`, bei mehreren mit `(+N)`.
- `renderBand(visual, today: Date, lang): string` in `src/band.js`, leer ohne `stand` und `status`. `div.vm-band` mit `span.vm-band-status` (wenn `status`) und `stand` als `1. November 2026` (de) oder `1 November 2026` (en), Monatsnamen als eigene Liste, weil QuickJS kein `Intl` hat. Ist der Stand mehr als `STALE_DAYS = 7` Tage vor `today`, bekommt das Band die Klasse `vm-stale` und den Text `stale`.
- `transform(markdown: string, { today: Date }): string` in `src/core.js`. Geht die Zeilen durch und merkt sich offene Fences (Zeichen und Länge, geschlossen durch dieselben Zeichen mit mindestens derselben Länge). Nur ein Fence in Spalte 0 mit Info genau `steps`, das nicht in einem anderen Fence liegt, wird ersetzt. Pro Block laufen `parseSteps` und `validateSteps` in `try/catch`. Bei Fehlern oder Ausnahme kommt `renderError`, sonst `renderSteps`. Das Band steht direkt nach der ersten `# `-Zeile, wenn sie die erste nicht leere Zeile nach dem Frontmatter ist, sonst direkt nach dem Frontmatter. Erzeugtes HTML hat keine Leerzeile und steht von Leerzeilen umgeben, damit markdown-it es als HTML-Block durchreicht. Ohne Band und ohne ersetzten Block kommt die Eingabe unverändert zurück.

- [ ] Failing Tests in `test/transform.test.js`, alle mit `today = new Date('2026-11-01T12:00:00')`:
      `leaves files without visual and steps unchanged`: strikte Gleichheit.
      `renders a top-level steps block`: Ausgabe enthält `class="vm-steps"` und nicht mehr ```` ```steps ````.
      `keeps steps inside a longer fence as code`: ```` ````markdown ```` mit einem `steps`-Block darin bleibt unverändert.
      `shows an error box with the file line`: Eingabe `"---\nid: x\n---\n# T\n\n```steps\n- [ ] a: A\n- [ ] b: B | nach: zz\n```\n"`, der Schritt `b` steht in Dateizeile 8, Ausgabe enthält `vm-error` und `Zeile 8`.
      `inserts the band after the title`: die Zeile nach `# T` ist leer, die danach beginnt mit `<div class="vm-band`.
      `marks a stand older than seven days as stale`: `stand: 2026-10-24` ergibt `vm-stale`, `stand: 2026-10-25` nicht.
      `uses English labels with lang en`: enthält `0 of 1 done`.
      `escapes HTML and renders code in labels`: Beschriftung `` `a` <b> `` ergibt `<code>a</code> &lt;b&gt;`.
      `rendered HTML contains no blank line`: Kein `\n\n` innerhalb des erzeugten `div`.
- [ ] `node --test test/transform.test.js`: FAIL
- [ ] `src/html.js`, `src/steps/render.js`, `src/band.js`, `src/core.js` umsetzen
- [ ] `node --test test/transform.test.js`: PASS
- [ ] Commit

### Task 4: `parser.js`, Installation und Stile

**Produces:** `parser.js` als ein Ausdruck, den MPE so lädt: `(${inhalt.trim().replace(/[;,]+$/, "")})`.

- [ ] `src/parser-entry.js`: `export default { onWillParseMarkdown: async (markdown) => transform(markdown, { today: new Date() }), onDidParseMarkdown: async (html) => html }`
- [ ] `scripts/build-parser.mjs`: esbuild-API mit `entryPoints: ['src/parser-entry.js']`, `bundle: true`, `format: 'iife'`, `globalName: '__visualMarkdown'`, `target: 'es2020'`, `write: false`. Schreibt `parser.js` als `(() => {` + Zeile `// Generated from src/ by npm run build. Do not edit.` + Bundle + `return __visualMarkdown.default;` + `})()`. Kein Kommentar vor der ersten Klammer.
- [ ] Failing Tests in `test/parser-build.test.js`:
      `parser.js evaluates as one expression and renders steps`: Datei lesen, wie MPE einklammern, mit `(0, eval)` auswerten, `await hooks.onWillParseMarkdown(md)` enthält `vm-steps`, `await hooks.onDidParseMarkdown('<p>x</p>')` ergibt `'<p>x</p>'`.
      `parser.js has no require or import`: kein Treffer für `/\brequire\(|^\s*import\s/m`.
- [ ] `npm test`: alle PASS (baut vorher `parser.js`)
- [ ] `install.sh`: Schleife auf `for f in style.less config.js parser.js; do`. Die vorhandene Logik sichert die heutige Standarddatei als `parser.js.bak`.
- [ ] `style.less`: die sechs Zeilen `--m-warn-fill` bis `--m-bad-stroke` aus `.markdown-preview.markdown-preview .mermaid` (Zeilen 187–192) in den Block `.markdown-preview.markdown-preview` ab Zeile 3 verschieben, die dunklen (Zeilen 207–212) in `body.vscode-dark .markdown-preview.markdown-preview` ab Zeile 158. Mermaid erbt sie weiter. Am Ende ein Abschnitt `/* Visual Markdown: Stand-Band und steps */` unter `.markdown-preview.markdown-preview` mit diesen Regeln als Start:
      `.vm-band` Flex, Abstand 12px, Padding 6px 12px, Radius 6px, Schrift 14px, Hintergrund `--m-ok-fill`, linker Rand 4px `--m-ok-stroke`, Abstand unten 24px. `.vm-band.vm-stale` mit `--m-warn-fill` und `--m-warn-stroke`. `.vm-band-status` fett.
      `.vm-steps` Rand 1px `--border`, Radius 8px, Padding 12px 16px, Abstand 16px oben und unten. `.vm-steps-head` Flex mit `space-between`, 14px, `--muted`. `.vm-progress` 160px breit, 6px hoch, Hintergrund `--border`, das innere `span` in `--m-ok-stroke`.
      `.vm-steps-list` ohne Listenpunkte und Einzug. `.vm-step` als Grid `20px 1fr auto auto` mit 12px Abstand, Trennlinie oben in `--border`, nicht beim ersten. `.vm-who` und `.vm-note` 14px in `--muted`, die Notiz rechtsbündig.
      `.vm-done .vm-icon` in `--m-ok-stroke`, `.vm-done .vm-label` in `--muted`. `.vm-waiting .vm-icon` und `.vm-waiting .vm-note` in `--m-warn-stroke`. `.vm-can-start .vm-note` fett in `--m-ok-stroke`.
      `.vm-now` und `.vm-waves` 14px mit 8px Abstand oben. `.vm-error` wie das Band, aber in `--m-bad-fill` und `--m-bad-stroke`.
- [ ] `scripts/preview.mjs <in.md> <out.html> [--dark]`: Frontmatter entfernen, `transform` mit heutigem Datum, `markdown-it({ html: true })`, `style.less` über `less.render`, HTML mit `body.preview-container` (bei `--dark` zusätzlich `vscode-dark`) und darin `div.markdown-preview[data-for="preview"]`.
- [ ] `npm run preview -- docs/playbook/canvases/visual-markdown.md /tmp/vm-canvas.html` und Screenshot mit `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1100,1600 --screenshot=/tmp/vm-canvas.png file:///tmp/vm-canvas.html`. Erwartet: Der Block unter „Reihenfolge“ ist eine Liste, das Beispiel im ```` ````markdown ````-Fence bleibt Code. Dasselbe mit `--dark`.
- [ ] Commit (mit `parser.js`)

### Task 5: Kopie der Statusseite und Token-Vergleich

- [ ] Im Accenture-Repo `Docs/human/slb-project-status.md` nach `Docs/tmp/visual-markdown/slb-project-status.md` kopieren. Darin genau drei Änderungen: `id: tmp.visual-markdown.slb-project-status`, nach `derivedFrom` ein Block `visual:` mit `  stand: 2026-11-01`, und im ersten Absatz `Stand: 1. November 2026. ` streichen. Die Tabelle unter „Nächste Entscheidungen“ wird zu:

```steps
- [~] er4: ER4 abschließen und übernehmen | fertig wenn: Auslese vollständig, Feldklärung und Stichproben geprüft, Übernahmeprüfungen bestanden | wer: Lio
- [!] lp: Lieferantenpakete und Excel-Mappe neu bauen | wartet auf: Entscheidung über den Neubau aus der neuen Ground Truth | wer: Dennis
- [!] sa: Startauswahl und zurückgestellte Lieferanten klären | wartet auf: Rückmeldung auf das geteilte Paket | wer: Accenture | seit: 30. Oktober
- [ ] lm: Artikel gegenlesen und Lieferantenmails vorbereiten | nach: sa | fertig wenn: Preispositionen belegt | wer: Lio, danach Accenture
- [ ] er5: ER5 außerhalb von Batch 1 ausführen | fertig wenn: eigener eingefrorener Umfang, geprüfte Übernahme | wer: Lio
```

      Erwartet im Preview: `0 von 5 fertig`, „Jetzt möglich“ zeigt ER5, zwei Wellen (er4, lp, sa, er5, dann lm).
- [ ] `npm run tokens -- <Accenture>/Docs/human/slb-project-status.md <Accenture>/Docs/tmp/visual-markdown/slb-project-status.md`. Ausgabe je Datei `<tokens>\t<pfad>`, gezählt mit `encode` aus `gpt-tokenizer/encoding/o200k_base`. Beide Zahlen notieren.
- [ ] Preview und Screenshot der Kopie nach `/tmp/vm-status.png` und `/tmp/vm-status-dark.png`, wie in Task 4.
- [ ] Im Accenture-Ordner `node /Users/dennis/.agents/skills/docdriven-audit/scripts/check-graph.mjs --root .`: ohne Fehler und ohne Warnungen.
- [ ] Nicht committen, siehe Guardrails der Spec.

### Task 6: Test mit Dennis und Abschluss

- [ ] `./install.sh`, danach in VS Code `Developer: Reload Window`.
- [ ] Dennis prüft im MPE-Preview: die Kopie in hell und dunkel; ein falsches Kürzel in `nach:` zeigt den Fehlerkasten mit Zeilennummer, danach zurücksetzen; die echte `slb-project-status.md` und `Docs/human/bundling-agent-canvas.md` mit Mermaid-Diagramm sehen aus wie vorher.
- [ ] PDF-Export der Kopie über `Markdown Preview Enhanced: Chrome (Puppeteer) Export` als PDF. Band und Liste sind drin. Das PDF danach nach `/tmp` verschieben, es enthält Kundendaten.
- [ ] Zehn-Sekunden-Test mit Dennis, die beiden Token-Zahlen daneben.
- [ ] `README.md`: In „Was drin ist“ Zeilen für `parser.js` (Bausteine, erzeugt aus `src/`, nicht von Hand ändern) und `src/`. Neuer kurzer Abschnitt „Bausteine“: was Stand-Band und `steps` tun, Verweis auf das Canvas für das Format, `npm install && npm test` zum Bauen, `install.sh` verlinkt jetzt auch `parser.js`.
- [ ] `npm test`: PASS
- [ ] Ergebnis festhalten. Bei weiter: Schritt `proto` im Canvas ist gebaut, README besitzt den Stand, also `proto` aus „Reihenfolge“ entfernen und `nach: proto` bei `rest` streichen, diesen Plan und die Spec löschen. Ob die echte Statusseite umgestellt wird und die Kopie dann wegfällt, entscheidet Dennis. Bei aufhören: `~/.local/state/crossnote/parser.js.bak` zurück nach `parser.js`, die Kopie löschen, im Canvas einen Satz zum Abbruch und warum, Plan und Spec löschen.
- [ ] Commit im Repo `Visual-Markdown`. Im Accenture-Repo nur nach Dennis' Entscheidung.
