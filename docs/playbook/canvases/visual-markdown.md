---
visual:
  status: Approved
  created: 2026-11-01
  as-of: 2026-11-02
  lang: de
---
# Visual Markdown — Brainstorming Canvas

> **Status:** Approved — basis for specs
>
> Living map of this brainstorm. Rewrite it when the direction changes.
> Specs and plans are distilled from this file. Not canonical product behavior.
> After shipping, the README and skills own shipped truth; leftovers hold
> remaining work only, then delete when nothing remains.
>
> Der Prototyp ist gebaut. Jeder weitere Baustein bekommt vor dem Bauen einen eigenen kurzen Entwurf.

## Ziel

Ein Markdown-Format, das im Preview von Markdown Preview Enhanced (MPE) für Menschen richtig gut aussieht und für LLMs trotzdem schlank bleibt. Dazu ein Skill, mit dem Agents darin illustrieren und arbeiten. Kollegen können es installieren, extern geht es als PDF raus.

## Leitidee

Die Datei beschreibt Inhalt und Zustand, der Renderer die Darstellung. Alles Visuelle steckt in `style.less` und `parser.js`, die ein lesender Agent nicht mitlädt. Bestehende Markdown-Muster bleiben erhalten. Eigene Codeblöcke gibt es nur, wo Markdown keine Form hat: Schritte mit Abhängigkeiten, Diagramme, Skalen, Bildreihen, Vergleiche und Begriffslisten.

Der Gewinn ist explizite Struktur, die der Renderer zeigen und verlinken kann. Tokens sparen vor allem Standardtexte, die der Renderer ergänzt, und eingebundene statt kopierte Inhalte.

## Regeln für das Format

- Dateien bleiben `.md`. Ein Schlüssel `visual:` im Frontmatter markiert sie und hält Status, Stand, Sprache, Badges und `share:`.
- Es gibt sechs eigene Codeblöcke: `steps`, `chart`, `scale`, `gallery`, `compare` und `glossary`. Alles andere sind Muster, die man ohne Renderer genauso schreiben würde: Überschriften mit fetten Labels, Tabellen, Frontmatter und die Callout-Syntax von GitHub.
- Jeder Block und jedes Muster ist ohne Renderer verständlich. Namen und Felder sprechen für sich, damit ein lesendes LLM keinen Skill braucht. Auf GitHub erscheinen Blöcke als lesbarer Codeblock.
- Jeder Baustein hat ein Schema mit seinen Feldern, Typen, erlaubten Werten und Pflichtfeldern. Renderer, Check-Skript und die Referenz im Skill lesen alle daraus, damit Beschreibung und Verhalten nicht auseinanderlaufen.
- Viele Zeilen mit kurzen Feldern bleiben eine normale Tabelle, weil YAML die Feldnamen bei jedem Eintrag wiederholt. Fließtext bleibt normales Markdown, Flussdiagramme Mermaid, Formeln KaTeX.
- Eingebunden wird mit MPEs `@import "datei.md"`, das auch im PDF-Export läuft. `parser.js` selbst kann keine Dateien lesen, deshalb liest `chart` seine Zahlen aus der Tabelle direkt darüber. Kein Inline-SVG und kein Base64 in der Quelldatei.
- Texte, die der Renderer ergänzt, gibt es auf Deutsch und Englisch. Die Sprache steht im Frontmatter.
- Statisch bis auf den Kopierknopf an jedem Schritt. Er braucht ein kleines Skript, das MPE nur mit `enablePreviewScripts` lädt. Ohne die Einstellung, im PDF und auf GitHub fehlt nur der Knopf. `enableScriptExecution` bleibt aus.
- Ein kaputter Block zeigt im Preview einen Fehlerkasten mit Zeilennummer, statt still zu verschwinden. Das Check-Skript nutzt denselben Kern wie der Renderer, Agents lassen es nach dem Schreiben laufen.
- Gilt für Dokumente, die Menschen anschauen: Canvasse, Statusseiten, Entscheidungen, Fragensammlungen, Berichte. Knowledge-Docs, die vor allem Agents lesen und schreiben, bleiben schlichtes Markdown.
- Erfolgsmaß: Eine nachgebaute Seite braucht nicht mehr Tokens als die schlichte Version, und man erfasst den Stand beim Draufschauen in zehn Sekunden.

## Bausteine

| Baustein | Wo es heute vorkommt | Wie man es schreibt | Was der Renderer zeigt | Runde |
| --- | --- | --- | --- | --- |
| Status | Kopf jedes Canvas und jeder Statusseite | `status:`, `created:` und `as-of:` unter `visual:` im Frontmatter | Farbiges Band mit Status, Daten und Kopierknopf, Warnung bei altem Stand | 1 |
| Abschnitte | Canvasse und Statusseiten | `## Titel {#id updated=…}`, Format in der [README](../../../README.md#abschnitte) | Badges mit Kennung und Datum, Kopierknopf | 1 |
| `steps` | Schritt-Tabellen in Canvassen, „Nächste Entscheidungen“ auf Statusseiten, Checkboxen und Prosa | Codeblock mit erweiterter Checkliste | Nummerierte Liste mit Zustand, Zuständigen und kurzen Abhängigkeitsverweisen | 1 |
| Karten | Entscheidungen mit E-IDs, Fragensammlungen, Hinweise mit Status | `> [!card Icon Farbe] Titel`, darunter normales Markdown | Karte mit Icon und Farbe aus festen Listen, auf GitHub ein lesbares Zitat, fertig | 1 |
| `chart` | Heute fast nur Zahlentabellen: Anteile und Spend je Lieferant, KPI-Werte über Wochen, Gewichte in LioCare | Codeblock direkt unter der Tabelle mit den Zahlen | Balken, Linien, Histogramme, Anteile, Heatmap, Wasserfall, Pareto, Streudiagramm, Fortschritt und Kennzahlen, im PDF als SVG, fertig | 1 |
| Callouts | Beispielfälle, Annahmen, Grenzen, Hinweise | `> [!NOTE]` und die übrigen vier GitHub-Arten, eigene Arten wie **Annahme:** fett am Anfang | Kasten je Art, MPE zeichnet ihn schon selbst, fertig | 1 |
| Badges | Data Status in LioCare, Prüfergebnisse in Findings, Zustände wie offen und entschieden | Eine Zeile im Frontmatter ordnet feste Wörter Farben zu | Getönte Pillen in Tabellenzellen, fertig | 1 |
| Wasserzeichen | Seiten mit Kundendaten | `share: intern` im Frontmatter | Badge im Band, schräges Wasserzeichen auf jeder PDF-Seite, fertig | 1 |
| IDs und Glossar | Entscheidungs-IDs wie E47, Frage 6 und Fachbegriffe im Fließtext | Karte mit der ID vorne im Titel, Begriffe im Codeblock `glossary` | Link auf Karte oder Begriff mit Erklärung beim Hovern, innerhalb derselben Datei, fertig | 2 |
| `scale` | Schwellen und Bereiche, etwa die Health States in LioCare | Codeblock mit einer Zeile je Bereich, Format in der [README](../../../README.md#skalen-galerien-und-vergleiche) | Getöntes Band über den ganzen Bereich, Grenzen darunter, Markierungen darüber, fertig | 2 |
| `gallery` | Screenshots, Referenzbilder, vorher und nachher, Dark und Light in LioCare | Codeblock mit normalen Markdown-Bildern | Bilder im Raster mit bis zu sechs Spalten und Bildunterschrift, auch im PDF, fertig | 2 |
| `compare` | Zwei bis vier Ansätze mit Vor- und Nachteilen beim Brainstorming | Codeblock mit `- Option`, darunter `+` und `-` | Spalten nebeneinander, Empfehlung mit Badge, fertig | 2 |

Details stehen unten nur für die Bausteine, bei denen die Tabelle nicht reicht.

### `steps`

Format, englische Syntax und Darstellung besitzt die [README](../../../README.md#steps), auch Beschreibung, Agent-Schritte, `thread`, Daten und den Kopierknopf. Die offene Arbeit steht unter „Roadmap“.

### `chart`

Format, Felder und Darstellung besitzt die [README](../../../README.md#diagramme). Das LLM sieht die Zahlen in der Tabelle, und niemand braucht Dateizugriff. Große Rohdaten verdichtet vorher ein Skript.

### Frontmatter

Alles, was für die ganze Datei gilt, steht unter einem Schlüssel `visual:` im Frontmatter, neben den vorhandenen DocDriven-Feldern wie `id` und `derivedFrom`:

```yaml
visual:
  status: Approved
  created: 2026-10-28
  as-of: 2026-11-01
  lang: de
  share: intern
  badges: { fertig: ok, offen: warn, fehlt: bad }
```

## Später

- Bei `steps`: Graph-Ansicht als Mermaid-Diagramm, die längste Kette bis zum Ziel, die Prüfung, ob parallele Schritte dieselben Dateien schreiben, und Fortschritt aus Unterpunkten.
- Verweise auf IDs und Begriffe in anderen Dateien. Dafür bräuchte es einen vorher gebauten Index, weil der Parser keine Dateien lesen kann.
- Weitere Chart-Typen wie Boxplot oder Flächendiagramm bei Bedarf. Anteile, Heatmap, Wasserfall, Pareto, Streudiagramm, Fortschritt und Kennzahlen gibt es seit dem 2. November.

## Zuhause, Verteilung, Export

- Zuhause ist dieses Repo, lokal und auf GitHub `Visual-Markdown`. Es enthält Theme, Mermaid-Konfiguration, `install.sh`, das Check-Skript und die Skills `visual-markdown` und `mermaid-theme`.
- Neu kommt ein Kern als JavaScript-Modul ohne Abhängigkeiten, mit den Schemas darin. MPE verlangt `parser.js` als eine einzige in sich geschlossene Datei, deshalb wird sie aus dem Kern gebaut. Das Check-Skript nutzt denselben Kern in Node.
- Kollegen installieren MPE, klonen das Repo und führen `install.sh` aus, das künftig auch `parser.js` verlinkt. Das ist der einzige Weg zum Verteilen.
- Externes Teilen läuft als statischer PDF-Export. Diagramme werden eingebacken, relative Links auf Repo-Dateien aufgelöst oder entfernt.
- Der Weg zu einem eigenen Viewer bleibt offen, weil der Kern zuerst eine eigene Datenstruktur erzeugt und daraus HTML mit eigenen CSS-Klassen, ohne an MPE-Interna zu hängen. `style.less` wird dafür in Farbwerte und Bausteinstile getrennt. Ein eigener Viewer, eine gehostete Seite oder MPEs eingebauter HTML-Export können dann denselben Kern nutzen.

## Roadmap {#roadmap updated=2026-11-02}

Der Prototyp mit Stand-Band, Abschnitten und `steps` ist gebaut und am 1. November an einer echten Statusseite getestet, den Stand besitzt die [README](../../../README.md). Das Token-Ziel misst nur den Formataufwand, neuer Inhalt wie Beschreibungen zählt nicht mit. Badges in Tabellenzellen, generische Karten, das Wasserzeichen und `chart` sind ebenfalls gebaut, damit ist die erste Runde vollständig. MPE zeichnet `vega-lite` schon vor dem Druck zu SVG, und unser Parser läuft auch im HTML- und PDF-Export. Das Wasserzeichen schützt gegen Versehen, nicht gegen Absicht, deshalb meldet das Check-Skript Kundenseiten ohne `share: intern`. Das Format steht jeweils in der [README](../../../README.md#badges). Callouts zeichnet MPE schon selbst, Tabellen und Links haben den Kartenstil. Die zweite Runde mit `scale`, `gallery`, `compare` sowie Verweisen auf IDs und Begriffe ist seit dem 2. November ebenfalls gebaut.

```steps
- [x] skill: Agent-Skill und Check-Skript | owner: Agent | updated: 2026-11-02
  Der Skill `visual-markdown` verweist auf die README als Formatquelle und regelt, was er dort nicht findet: welcher Baustein wann passt, dass Daten den letzten inhaltlichen Stand meinen und dass nichts erfunden wird. `install.sh` verlinkt ihn. Das Check-Skript meldet Fehler und fehlende Daten mit denselben Parsern wie der Renderer.
- [x] rename: GitHub-Repo in `Visual-Markdown` umbenennen | owner: Agent | after: skill | updated: 2026-11-02
  Die alte Adresse leitet GitHub weiter.
- [~] status: Echte Statusseite im Alltag | owner: Dennis | after: rename | done-when: Die Accenture-Statusseite ist eine Woche lang in Visual Markdown gepflegt, Schrittliste und Stand im Band sind dabei aktuell geblieben | updated: 2026-11-02
  Ein frischer Agent stellt die Seite nur mit dem Skill um, das testet zugleich den Skill. `brainstorming` und `docdriven` verweisen auf den Skill. Die Schrittliste zeigt die Arbeit aller Beteiligten, persönliche Aufgaben bleiben in Notion.
- [ ] more: Entscheidungen und Fragensammlung umstellen | owner: Dennis | after: status | done-when: Beide Accenture-Seiten nutzen Karten mit ihren IDs | updated: 2026-11-02
  Erst wenn sich die Statusseite bewährt hat.
- [ ] share: Kollegentest | owner: Dennis | after: rename | done-when: Ein Kollege hat es mit `install.sh` eingerichtet und eine Seite im Preview gesehen | updated: 2026-11-02
  Die README beschreibt die Einrichtung.
```

## Offene Fragen

- LioCare hat eine eigene Kopie des Notion-Themes im Repo-Root. Ziehen Projekte das Theme künftig nur noch aus diesem Repo?

## Nicht jetzt

- Eigene Blöcke für Status, Entscheidungen, Fragen, Prüfungen, Callouts und Spalten: Frontmatter, Markdown-Muster, Badges und GitHub-Callouts reichen dafür.
- Eigene Dateiendung und MDX: Dateien sollen auf GitHub und für Agents ohne zusätzliche Laufzeit lesbar bleiben. Markdoc-Tags und Variablen würden Inhalt ohne Renderer verstecken.
- ReadMe als Plattform: Zuhause bleibt das Repo, geteilt wird per PDF. Callouts, Einbinden und Glossar dienen als Anregung.
- `src:` für Dateiimporte und projekteigene `.crossnote/`-Kopien: Der Parser hat keinen Dateizugriff, MPEs `@import` übernimmt das Einbinden. Ein Projektparser würde den globalen Parser ersetzen und auseinanderlaufen.
- `steps` statt der Tabelle „Execution Schedule“ in `writing-plans`: Die Tabelle trägt Tasks und Review und wird von Agents ohne Renderer gelesen.
- HTML-Export, eigener Viewer, eigene VS-Code-Extension, frei verschiebbares Whiteboard und JavaScript im Preview über den Kopierknopf hinaus.
