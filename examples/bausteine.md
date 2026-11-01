---
visual:
  status: In Arbeit
  created: 2026-10-28
  as-of: 2026-11-01
  lang: de
---
# Alle Bausteine im Überblick

Diese Seite zeigt jeden Baustein, den Renderer und Theme heute können, an einem ausgedachten Projekt. Wer etwas an `src/` oder `style.less` ändert, öffnet sie im MPE-Preview und schaut, ob alles noch so aussieht wie beschrieben. Was noch nicht gebaut ist, steht im letzten Abschnitt.

## Stand-Band {#band updated=2026-11-01}

Das grüne Band über diesem Abschnitt kommt aus dem Frontmatter. Es zeigt Status, Stand und Erstellungsdatum. Rechts kopiert ein Knopf den Pfad dieser Datei. Ist `as-of` älter als sieben Tage, wird das Band gelb und sagt das dazu.

```yaml
visual:
  status: In Arbeit
  created: 2026-10-28
  as-of: 2026-11-01
  lang: de
```

## Abschnitte mit Kennung {#abschnitte updated=2026-11-01}

Diese Überschrift ist selbst ein Beispiel. In der Datei steht `## Abschnitte mit Kennung {#abschnitte updated=2026-11-01}`. Im Preview verschwinden die Klammern, darunter stehen Kennung, Datum und ein Kopierknopf für `pfad.md#abschnitte`.

### Alter Abschnitt {#alt updated=2026-10-01}

Das Datum ist älter als sieben Tage und erscheint deshalb gelb.

### Abschnitt ohne Datum {#ohne-datum}

Hier fehlt `updated`, deshalb steht im Badge „Datum fehlt“.

### Abschnitt ohne Kennung

Überschriften ohne geschweifte Klammern bleiben unverändert.

## Schritte {#schritte updated=2026-11-01}

Der Block enthält jeden Zustand und jedes Feld. Die Beschreibungen sagen, worauf man jeweils achten soll.

```steps
- [x] daten: Rechnungen auslesen | owner: Team | updated: 2026-10-27
  Die Rechnungen aus dem Export sind ausgelesen und den richtigen Lieferanten zugeordnet. Fertige Schritte zeigen ihre Beschreibung grau und kein Ziel mehr.
- [~] anreichern: Positionen anreichern | owner: Agent | thread: [Thread: Positionen anreichern; ref=thread_beispiel] | next: Stichprobe ziehen und offene Felder klären | done-when: jede Position hat Maß, Material und Einheit | after: daten | updated: 2026-11-01
  Ein Agent ergänzt fehlende Angaben wie Maße, Material und Einheit. Unten stehen Agent-Icon und Thread. Der Kopierknopf rechts kopiert Pfad, Kennung und Thread.
- [ ] doku: Vorgehen dokumentieren | owner: Dennis | next: Gliederung anlegen | updated: 2026-10-31
  Hält fest, wie die Daten entstanden sind. Der Schritt hat keine offenen Abhängigkeiten und steht deshalb unter „Kann starten“.
- [ ] pruefen: Stichprobe gegenlesen | owner: Qualitätsteam | after: anreichern | done-when: 50 Positionen ohne systematischen Fehler | updated: 2026-11-01
  Das Qualitätsteam vergleicht eine Stichprobe mit den Originalrechnungen. Die Nummer unter „Dependencies“ ist indigo, weil der Schritt davor läuft.
- [ ] liste: Preisliste übernehmen | owner: Agent, danach Dennis | after: pruefen, freigabe | updated: 2026-11-01
  Die geprüften Daten gehen in die zentrale Preisliste. Eine Nummer ist grau, weil der Schritt noch nicht begonnen hat, die andere gelb, weil er wartet.
- [!] freigabe: Lieferantenauswahl freigeben | owner: Projektleitung | waiting-for: Rückmeldung zur geteilten Auswahl | since: 30. Oktober | updated: 2026-10-30
  Die Projektleitung entscheidet, mit welchen Lieferanten die erste Runde startet. „seit“ steht hinter dem Wartegrund.
- [ ] export: Altdaten exportieren | owner: Kunde | waiting-for: Zugang zum Altsystem | updated: 2026-10-20
  Ein offener Schritt mit Wartegrund landet unter „Wartet“. Das Datum ist älter als sieben Tage und erscheint gelb.
- [ ] archiv: Altdaten archivieren | owner: Team | after: export
  Ohne `updated` zeigt das letzte Badge „Datum fehlt“.
```

### Fehlerkasten {#fehler updated=2026-11-01}

Ein kaputter Block zeigt statt der Liste einen Fehlerkasten mit der Zeile in der Datei. Hier verweist `after` auf ein Kürzel, das es nicht gibt.

```steps
- [ ] a: Schritt mit falscher Abhängigkeit | after: gibtsnicht | updated: 2026-11-01
```

## Callouts {#callouts updated=2026-11-01}

Die fünf Arten von GitHub zeichnet MPE selbst.

> [!NOTE]
> Ein Hinweis, den man beim Überfliegen mitnehmen soll.

> [!TIP]
> Ein Tipp, der die Arbeit leichter macht.

> [!IMPORTANT]
> Etwas, das man für die Entscheidung wissen muss.

> [!WARNING]
> Etwas, das schiefgehen kann, wenn man es übersieht.

> [!CAUTION]
> Etwas, das man nicht tun sollte.

## Normales Markdown {#markdown updated=2026-11-01}

Text mit **fett**, *kursiv*, `Code` und einem [Link](https://github.com), der als Badge mit Link-Icon erscheint. Tastenkürzel wie <kbd>Cmd</kbd> + <kbd>C</kbd> haben eine eigene Form. Tabellen sehen aus wie die Karte der Schrittliste.

| Lieferant | Positionen | Stand |
| --- | ---: | --- |
| Lieferant A | 120 | angereichert |
| Lieferant B | 45 | offen |

- [x] Eine erledigte Aufgabe
- [ ] Eine offene Aufgabe

> Ein normales Zitat ohne Callout-Art.

```js
const fortschritt = fertig / gesamt;
```

Formeln laufen über KaTeX: $\text{Fortschritt} = \frac{\text{fertig}}{\text{gesamt}}$

---

## Mermaid {#mermaid updated=2026-11-01}

```mermaid
flowchart LR
    S(( )):::dot --> A["<b>Export</b><br/>Rechnungen auslesen"]:::code
    A --> B["Positionen anreichern"]:::llm
    B --> C{{"Stichprobe ok?"}}:::gate
    C -- nein --> E["Gegenlesen"]:::human
    E --> B
    C -- ja --> D[("Preisliste")]:::store
    D --> F["Lieferanten anschreiben"]:::accent
    F --> G["Angebot da"]:::ok
    F --> H["Rückfrage"]:::warn
    F --> I["Absage"]:::bad
    G --> Z(( )):::dot
```

Code, Modellschritt, Mensch, Entscheidung und Ablage haben je eine eigene Farbe. Blau ist der hervorgehobene Schritt, Grün, Gelb und Rot sind Ergebnisse, die Punkte Start und Ende.

```mermaid
sequenceDiagram
    participant D as Dennis
    participant A as Agent
    D->>A: Verweis auf einen Schritt einfügen
    A->>A: Schritt in der Datei lesen
    A-->>D: Stand und nächste Handlung
```

## Noch nicht gebaut {#offen updated=2026-11-01}

Aus der ersten Runde fehlen noch Karten für Entscheidungen und Fragen, `chart` für Diagramme aus Tabellen, Badges für gefärbte Tabellenzellen und das Wasserzeichen im PDF. Die zweite Runde mit Links und Erklärungen für IDs, `scale`, `gallery` und `compare` ist noch nicht begonnen.
