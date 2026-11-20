---
visual:
  status: Brainstorming
  created: 2026-11-20
  as-of: 2026-11-20
  lang: de
---
# Abläufe mit mehr Information als Mermaid

> **Main question:** Brauchen wir einen eigenen Baustein, der Abläufe besser zeigt als ein reines Mermaid-Diagramm, und was muss er wirklich können?
>
> Living map of this brainstorm. Rewrite it when the direction changes.
> Specs and plans are distilled from this file. Not canonical product behavior.
> After shipping, the README and skills own shipped truth; leftovers hold remaining work only, then delete when nothing remains.

## Was die Dokumente heute zeigen {#bestand updated=2026-11-20}

Gezählt am 20.11. in den eigenen Dokumenten unter `Customers/Accenture`, `LioCare` und `Onboarding-automation`: 26 Mermaid-Diagramme. Nicht mitgezählt sind askLio, t3code, dieses Repo und die Historienordner.

| Befund | Anzahl von 26 |
| --- | --- |
| Mindestens eine Entscheidung (`:::gate`) | 16 |
| Mit Phasen oder Bahnen (`subgraph`) | 9 |
| Direkt darunter eine handgeschriebene Legende („Legende: blau rechnet der Code, orange …“) | rund 20 |
| Durchschnittliche Knotenbeschriftung über 40 Zeichen, meist `<b>Titel</b><br/>Erklärung` | 14 |
| Darunter eine nummerierte Liste, die die Knoten einzeln erklärt | 4 |

Heißt konkret: Abzweigungen sind der Normalfall, ein Block nur für gerade Abläufe deckt die Minderheit ab und müsste Mermaid trotzdem nachbauen. Was fehlt, ist Platz für Information. Die Erklärung wird heute in die Kästen gequetscht oder in einer zweiten Liste darunter wiederholt, die man über Nummern im Kopf zuordnet, und die Legende schreibt jeder Agent anders, teils mit widersprüchlichen Farben (einmal ist Mensch grün, einmal blau).

Beispiele: `bundling-umbau/01_artikel_und_familien.md` (Diagramm plus sechs nummerierte Erklärungen), `Docs/human/autonomous-sourcing-process.md` (sechs Diagramme, jedes mit Legende, zwei mit nummerierter Liste), `LioCare/docs/playbook/photo-agent/00_overview.md` (Diagramm plus acht nummerierte Abschnitte).

## Richtung {#richtung updated=2026-11-20}

Vorschlag, noch nicht entschieden: Mermaid bleibt für die Form zuständig, der Baustein legt die Information daneben. Ein Block `flow` enthält oben ein normales Mermaid-Diagramm mit kurzen Knotennamen und nach einer Trennzeile `---` eine Notiz je Knoten.

````markdown
```flow
says: Je Lieferant, Position für Position.
flowchart LR
  daten["Datenfehler prüfen"]:::code --> kat["Kategorien bilden"]:::llm --> was{{"Was tun?"}}:::gate
  was -->|nicht erklärt| ziel["Zielpreis an Lieferant"]:::human
  was -->|erklärt| ann(["Annehmen"]):::dot
---
daten: Einheit, Incoterm, Menge und Mindestmenge müssen zur Baseline passen. | von Hand
kat: Kategorie heißt die Art des Produkts mit gemeinsamem Preistreiber. | Idee
was: Den Zielpreis ändern darf nur der SLB Category Owner (E32).
ziel: Ziel ist die Baseline als Dollarbetrag. | Idee
```
````

Der Renderer macht daraus drei Teile:

1. Das Diagramm, wie Mermaid es zeichnet. Jeder Knoten mit Notiz bekommt eine Nummer in der Reihenfolge der Notizen, und ein Klick auf den Knoten springt zur Notiz.
2. Eine Legende, die er aus den benutzten Klassen erzeugt, mit den Farben aus dem Theme. Die handgeschriebene Legende entfällt.
3. Die Notizen als nummerierte Liste: Nummer in der Farbe der Knotenart, Knotenname als Titel, Art als kleines Wort, Badge rechts, Erklärung darunter. Bei einer Entscheidung erscheinen die Beschriftungen der ausgehenden Pfeile als Ausgänge, ohne dass man sie zweimal schreibt.

Die Abgrenzung wird damit einfach: Ein Diagramm ohne Erklärung bleibt ein normaler `mermaid`-Block, braucht ein Knoten mehr als seinen Namen, wird es ein `flow`. Arbeit, die jemand erledigt, bleibt `steps`.

Ein Teil davon lohnt sich auch ohne neuen Block: Die Legende aus den Klassen kann der Renderer unter jedes normale Mermaid-Diagramm setzen. Das betrifft die rund 20 Diagramme mit handgeschriebener Legende sofort.

Noch zu prüfen: ob der Parser einen `flow` vor MPE in einen `mermaid`-Block plus HTML umschreiben kann, sodass MPE das Diagramm wie bisher zeichnet, und ob die Klick-Sprünge im Preview und im PDF funktionieren.

## Offene Fragen {#offen updated=2026-11-20}

> [!card question yellow] Zuerst nur die automatische Legende oder gleich den ganzen Block?
> Die Legende ist klein, ändert an keiner Datei die Syntax und hilft bei 20 Diagrammen. Der Block braucht Parser, Nummerierung und Verlinkung.

> [!card question grey] Braucht ein `flow` ohne Diagramm eine eigene Form?
> Bei einem rein geraden Ablauf könnte man das Diagramm weglassen, dann erscheint nur die nummerierte Liste mit Linie. Erst klären, wenn der Hauptfall steht.

## Verworfen

Ein eigener Block nur für gerade Abläufe mit selbst gezeichneten Abzweigungen: deckt die Minderheit ab, und Abzweigungen als Kacheln oder Äste sahen schlechter aus als Mermaid.
