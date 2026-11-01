# Visual Markdown — Brainstorming Canvas

> **Status:** Approved — basis for specs
>
> Living map of this brainstorm. Rewrite it when the direction changes.
> Specs and plans are distilled from this file. Not canonical product behavior.
> After shipping, the README and skills own shipped truth; leftovers hold
> remaining work only, then delete when nothing remains.
>
> Größe M, Plan Lite: ein zusammenhängender Prototyp, kein Paket, das sich getrennt prüfen ließe.

## Ziel

Ein Markdown-Format, das im Preview von Markdown Preview Enhanced (MPE) für Menschen richtig gut aussieht und für LLMs trotzdem schlank bleibt. Dazu ein Skill, mit dem Agents darin illustrieren und arbeiten. Kollegen können es installieren, extern geht es als PDF raus.

## Leitidee

Die Datei beschreibt, was da ist. Der Renderer entscheidet, wie es aussieht. Tokens kostet nur die Datei, alles Visuelle steckt in `style.less` und `parser.js`, die kein LLM beim Lesen mitlädt.

Wo unsere Docs schon ein festes Muster haben, erkennt der Renderer es, statt ein neues Format zu verlangen. Eine Entscheidung bleibt eine Überschrift mit **Entschieden:** und **Warum:**, sie sieht im Preview nur besser aus. Eigene Codeblöcke gibt es nur dort, wo Markdown nichts Passendes hat: für Schritte mit Abhängigkeiten und für Diagramme.

Gegenüber gut geschriebenem Markdown sparen Bausteine kaum Tokens, gegenüber HTML sehr viel. Ihr eigentlicher Gewinn ist, dass die Struktur explizit wird und der Renderer sie zeigen und verlinken kann. Echte Ersparnis kommt von dem, was aus der Datei verschwindet: Standardtexte, die der Renderer ergänzt, und Inhalte, die eingebunden statt kopiert werden.

## Regeln für das Format

- Dateien bleiben `.md`. Ein Schlüssel `visual:` im Frontmatter markiert sie und hält Status, Stand, Sprache, Badges und `share:`.
- Es gibt zwei eigene Codeblöcke, `steps` und `chart`. Alles andere sind Muster, die man ohne Renderer genauso schreiben würde: Überschriften mit fetten Labels, Tabellen, Frontmatter und die Callout-Syntax von GitHub.
- Jeder Block und jedes Muster ist ohne Renderer verständlich. Namen und Felder sprechen für sich, damit ein lesendes LLM keinen Skill braucht. Auf GitHub erscheinen Blöcke als lesbarer Codeblock.
- Jeder Baustein hat ein Schema mit seinen Feldern, Typen, erlaubten Werten und Pflichtfeldern. Renderer, Check-Skript und die Referenz im Skill lesen alle daraus, damit Beschreibung und Verhalten nicht auseinanderlaufen.
- Viele Zeilen mit kurzen Feldern bleiben eine normale Tabelle, weil YAML die Feldnamen bei jedem Eintrag wiederholt. Fließtext bleibt normales Markdown, Flussdiagramme Mermaid, Formeln KaTeX.
- Eingebunden wird mit MPEs `@import "datei.md"`, das auch im PDF-Export läuft. `parser.js` selbst kann keine Dateien lesen, deshalb liest `chart` seine Zahlen aus der Tabelle direkt darüber. Kein Inline-SVG und kein Base64 in der Quelldatei.
- Texte, die der Renderer ergänzt, gibt es auf Deutsch und Englisch. Die Sprache steht im Frontmatter.
- Erst statisch. JavaScript im Preview braucht `enableScriptExecution` und kommt erst bei einem konkreten Bedarf.
- Ein kaputter Block zeigt im Preview einen Fehlerkasten mit Zeilennummer, statt still zu verschwinden. Das Check-Skript nutzt denselben Kern wie der Renderer, Agents lassen es nach dem Schreiben laufen.
- Gilt für Dokumente, die Menschen anschauen: Canvasse, Statusseiten, Entscheidungen, Fragensammlungen, Berichte. Knowledge-Docs, die vor allem Agents lesen und schreiben, bleiben schlichtes Markdown.
- Erfolgsmaß: Eine nachgebaute Seite braucht nicht mehr Tokens als die schlichte Version, und man erfasst den Stand beim Draufschauen in zehn Sekunden.

## Bausteine

| Baustein | Wo es heute vorkommt | Wie man es schreibt | Was der Renderer zeigt | Runde |
| --- | --- | --- | --- | --- |
| Status | Kopf jedes Canvas und jeder Statusseite | `status:` und `stand:` unter `visual:` im Frontmatter | Farbiges Band mit Status und Datum, Warnung bei altem Stand | 1 |
| `steps` | Schritt-Tabellen in Canvassen, „Nächste Entscheidungen“ auf Statusseiten, Checkboxen und Prosa | Codeblock mit erweiterter Checkliste | Fortschritt, Zustand und Zuständige je Schritt, „Jetzt möglich“, parallele Wellen | 1 |
| Entscheidungen | E-IDs in `entscheidungen.md` | Überschrift mit fetten Labels wie **Entschieden:** und **Warum:**, wie heute | Karte mit Status-Badge, ersetzte Entscheidungen als Link | 1 |
| Fragen | Fragensammlung mit Empfänger, Beobachtung, Bedarf und Plan B | Überschrift mit fetten Labels, wie heute | Karte mit Empfänger und Stand, oben die Zahl offener und beantworteter Fragen | 1 |
| `chart` | Heute fast nur Zahlentabellen: Anteile und Spend je Lieferant, KPI-Werte über Wochen, Gewichte in LioCare | Codeblock direkt unter der Tabelle mit den Zahlen | Balken, gestapelte Balken, Linien und Histogramme über Vega-Lite | 1 |
| Callouts | Beispielfälle, Annahmen, Grenzen, Hinweise | `> [!NOTE]` und die übrigen vier GitHub-Arten, eigene Arten wie **Annahme:** fett am Anfang | Kasten je Art, MPE zeichnet ihn schon selbst | 1 |
| Badges | Data Status in LioCare, Prüfergebnisse in Findings, Zustände wie offen und entschieden | Eine Zeile im Frontmatter ordnet feste Wörter Farben zu | Gefärbte Tabellenzellen in der ganzen Datei | 1 |
| Wasserzeichen | Seiten mit Kundendaten | `share: intern` im Frontmatter | Wasserzeichen im PDF | 1 |
| IDs und Glossar | E47, D14, ER4, Frage 6 und Fachbegriffe im Fließtext | Wie heute | Link und Erklärung beim Hovern, braucht einen vorher gebauten Index | 2 |
| `scale` | Schwellen und Bereiche, etwa die Health States in LioCare | Codeblock | Farbiges Band über den ganzen Bereich mit den Grenzen darauf | 2 |
| `gallery` | Screenshots, Referenzbilder, vorher und nachher, Dark und Light in LioCare | Codeblock | Bilder nebeneinander mit Bildunterschrift | 2 |
| `compare` | Zwei bis drei Ansätze mit Vor- und Nachteilen beim Brainstorming | Codeblock | Spalten nebeneinander, Empfehlung markiert | 2 |

Details stehen unten nur für die Bausteine, bei denen die Tabelle nicht reicht.

### `steps`

Der wichtigste Baustein: die Übersicht, wo wir stehen, was fehlt und was als Nächstes dran ist, zum Abarbeiten für Menschen und Agents. Heute steht dieser Stand verteilt und geht unter.

- Format ist eine erweiterte Checkliste. Das Kästchen trägt den Zustand: `[x]` fertig, `[~]` läuft, `[!]` wartet, `[ ]` offen. Jeder Schritt hat ein Kürzel. Nach einem Trennstrich stehen `nach: <Kürzel>` für interne Abhängigkeiten, `wartet auf:` für eine Partei oder Bedingung außerhalb der Liste und `wer:` für die Zuständigen. Optional sind `fertig wenn:`, `seit:` und ein Link auf die Step-Datei.
- Der Renderer zeigt oben den Fortschritt und berechnet „Jetzt möglich“: alle offenen Schritte, deren Vorgänger fertig sind und die auf nichts warten. Kein Prosatext zum Stand, der veraltet.
- Parallele Wellen rechnet der Renderer aus den Abhängigkeiten. Niemand pflegt sie von Hand.
- Sollen mehrere Seiten dieselben Schritte zeigen, liegen sie in einer eigenen kleinen Datei, und Statusseite wie Canvas binden sie mit `@import` ein.
- Das Check-Skript findet Zyklen und unbekannte Kürzel und gibt die Wellen als Text aus, damit ein ausführender Agent sie nicht herleiten muss.

````markdown
```steps
- [x] gt: Ground Truth aufbauen | wer: Lio
- [~] er4: ER4 abschließen und übernehmen | nach: gt | wer: Lio
- [!] sa: Startauswahl klären | wartet auf: Rückmeldung von Accenture
- [ ] ag: Artikel gegenlesen | wer: Lio
- [ ] lp: Lieferantenpakete neu bauen | nach: er4 | wer: Dennis
- [ ] lm: Lieferantenmails vorbereiten | nach: sa, lp, ag | wer: Lio, danach Accenture
```
````

```text
Batch 1                                       1 von 6 fertig  ██░░░░░░░░░░
● Ground Truth aufbauen                         Lio          fertig
◐ ER4 abschließen und übernehmen                Lio          läuft
⏸ Startauswahl klären                                        wartet auf Rückmeldung von Accenture
○ Artikel gegenlesen                            Lio          kann starten
○ Lieferantenpakete neu bauen                   Dennis       nach ER4
○ Lieferantenmails vorbereiten                  Lio, Acc.    nach Startauswahl, Paketen, Gegenlesen

Jetzt möglich: Artikel gegenlesen
```

### `chart`

`chart` steht direkt unter der Tabelle mit den Zahlen und sagt nur, welche Spalten wohin gehören. `parser.js` übersetzt beides vor dem Rendern in Vega-Lite, das MPE selbst zeichnet. Das LLM sieht die Zahlen in der Tabelle, und niemand braucht Dateizugriff. Für ein Histogramm steht die schon ausgezählte Verteilung in der Tabelle, große Rohdaten verdichtet vorher ein Skript. Pflichtfelder sind `says`, die Aussage in einem Satz, und `basis`, worauf die Zahlen beruhen. Gestapelte Balken gehen auch auf 100 %. Farben kommen aus dem Theme, die Palette beim Bauen mit dem Skill `dataviz` festlegen. Für Einzelfälle bleibt ein roher `vega-lite`-Block.

````markdown
```chart
type: histogram
x: Textlänge
y: Positionen
color: Quelle
says: SAP-Texte stauen sich bei genau 40 Zeichen, Cameron-Texte nicht.
basis: PO-Daten 2025, Zeilen im Scope
```
````

### Frontmatter

Alles, was für die ganze Datei gilt, steht unter einem Schlüssel `visual:` im Frontmatter, neben den vorhandenen DocDriven-Feldern wie `id` und `derivedFrom`:

```yaml
visual:
  status: Approved
  stand: 2026-11-01
  lang: de
  share: intern
  badges: { fertig: ok, offen: warn, fehlt: bad }
```

## Später

- Bei `steps`: Graph-Ansicht als Mermaid-Diagramm, die längste Kette bis zum Ziel, die Prüfung, ob parallele Schritte dieselben Dateien schreiben, und Fortschritt aus Unterpunkten.
- Weitere Chart-Typen wie Boxplot, Streudiagramm und Heatmap bei Bedarf.

## Zuhause, Verteilung, Export

- Zuhause ist dieses Repo. Der lokale Ordner heißt schon `Visual-Markdown`, das GitHub-Repo noch `MPE-Notion-Theme`. Es hat schon Theme, Mermaid-Konfiguration, `install.sh` und den Skill `mermaid-theme`, der nach demselben Prinzip arbeitet.
- Neu kommt ein Kern als JavaScript-Modul ohne Abhängigkeiten, mit den Schemas darin. MPE verlangt `parser.js` als eine einzige in sich geschlossene Datei, deshalb wird sie aus dem Kern gebaut. Das Check-Skript nutzt denselben Kern in Node.
- Kollegen installieren MPE, klonen das Repo und führen `install.sh` aus, das künftig auch `parser.js` verlinkt. Das ist der einzige Weg zum Verteilen.
- Externes Teilen läuft als statischer PDF-Export. Diagramme werden eingebacken, relative Links auf Repo-Dateien aufgelöst oder entfernt.
- Der Weg zu einem eigenen Viewer bleibt offen, weil der Kern zuerst eine eigene Datenstruktur erzeugt und daraus HTML mit eigenen CSS-Klassen, ohne an MPE-Interna zu hängen. `style.less` wird dafür in Farbwerte und Bausteinstile getrennt. Ein eigener Viewer, eine gehostete Seite oder MPEs eingebauter HTML-Export können dann denselben Kern nutzen.

## Reihenfolge

```steps
- [ ] proto: Prototyp an einer Kopie von `slb-project-status.md` mit Stand im Frontmatter und `steps`, Tokens vergleichen, Zehn-Sekunden-Test, ein PDF | fertig wenn: klar besser als die heutige Tabelle, sonst hören wir auf
- [ ] rest: Übrige erste Runde: Karten für Entscheidungen und Fragen, `chart`, Badges, Wasserzeichen, Callout-Stil | nach: proto
- [ ] skill: Skill und Check-Skript | nach: rest
- [ ] share: GitHub-Repo umbenennen, Einrichtung bei einem Kollegen testen | nach: rest
```

## Offene Fragen

- Noch zu prüfen: Ist ein Vega-Lite-Diagramm fertig gezeichnet, bevor Chrome das PDF druckt? Läuft unser Parser auch in MPEs eingebautem HTML-Export?
- Endgültigen Namen bestätigen, bevor das GitHub-Repo umbenannt wird.
- Wo verläuft die Grenze zwischen `steps` und den persönlichen Aufgaben in Notion, damit nichts doppelt gepflegt wird?
- Reicht ein Wasserzeichen, damit Kundendaten nicht ungewollt in einem geteilten PDF landen?
- LioCare hat eine eigene Kopie des Notion-Themes im Repo-Root. Ziehen Projekte das Theme künftig nur noch aus diesem Repo?

## Nicht jetzt

- Eigene Blöcke für `status`, `decision`, `question`, `checks`, `callout` und `split`: Frontmatter, erkannte Muster, Badges, GitHub-Callouts und `chart` decken sie ab, ohne dass Agents YAML mit Links und Einrückung schreiben müssen.
- `src:` zum Einbinden: `parser.js` läuft in einer abgeschotteten Umgebung ohne Dateizugriff. MPEs `@import` übernimmt das.
- Projekteigene Blöcke und `.crossnote/`-Ordner im Projekt: Ein solcher Ordner ersetzt den globalen Parser komplett, und die Kopien laufen auseinander.
- `steps` statt der Tabelle „Execution Schedule“ in `writing-plans`: Die Tabelle hat Spalten für Tasks und Review, und Agents in Codex und Cursor lesen sie ohne Renderer.
- Eigene Dateiendung: GitHub zeigt sie als Rohtext, und jeder Kollege muss sie VS Code erst beibringen. Der Schlüssel `visual:` reicht als Kennzeichen.
- MDX (Markdown mit React-Komponenten): braucht Build und React-Laufzeit, liest jedes `<` und `{` im Fließtext als Code und rendert weder in MPE noch auf GitHub. Passt erst, falls wir eine gehostete Doku-Seite bauen. Dann können die Bausteine dorthin übersetzt werden.
- Markdoc als Syntax, samt Variablen und Bedingungen: Seine Tags erscheinen ohne Renderer als Rohtext, und bei Variablen im Fließtext sähe ein lesendes LLM nur den Namen statt der Zahl. Übernommen sind das Schema je Baustein, das Einbinden und die getrennten Stufen.
- ReadMe als Plattform: gehostete API-Doku mit OpenAPI-Referenz, Analytics und Browser-Editor, eigene Komponenten über MDX. Übernommen sind Callouts als Zitatblock, das Einbinden und die Glossar-Idee.
- HTML-Export und interaktiver Export.
- Eigener Viewer oder eigene VS-Code-Extension.
- Frei verschiebbares Whiteboard wie Miro.
- JavaScript-Interaktivität im Preview.
