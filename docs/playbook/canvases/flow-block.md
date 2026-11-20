---
visual:
  status: Brainstorming
  created: 2026-11-20
  as-of: 2026-11-20
  lang: de
  badges: { idee: muted, teilweise: warn, von hand: info }
---
# Baustein `flow` für Abläufe

> **Main question:** Brauchen wir einen eigenen Baustein, der einen Ablauf in fester Reihenfolge schön zeigt, und wie sieht er aus?
>
> Living map of this brainstorm. Rewrite it when the direction changes.
> Specs and plans are distilled from this file. Not canonical product behavior.
> After shipping, the README and skills own shipped truth; leftovers hold remaining work only, then delete when nothing remains.

## Warum {#warum updated=2026-11-20}

Abläufe stehen heute in drei Formen in den Dokumenten, und keine passt richtig. Als `steps` bekommen sie Fortschritt, Zuständige und Todo-Gruppen, die bei einer Methode nichts sagen, und die Gruppierung nach Zustand zerstört die Reihenfolge. Als Mermaid-Diagramm passen Verzweigungen und Übersichten gut, aber ein Schritt mit zwei Sätzen Erklärung wird zu kleinem Text in einer Box. Als nummerierte Liste `1. **Titel.** Erklärung` ist der Inhalt richtig, aber die Darstellung flach, und ein Schritt kann keinen Stand oder keine Art tragen.

Nummerierte Abläufe mit Titel und Erklärung gibt es schon mehrfach in den Accenture-Dokumenten, etwa die Prüfreihenfolge in `batch1/08_preise_einordnen.md`, der Ablauf des Bundling Agent in `bundling-umbau/01_artikel_und_familien.md` (sechs Schritte, jeweils Modell, Code oder Nutzer) und der Paketplaner in `Docs/human/autonomous-sourcing-process.md`.

Abgrenzung: `flow` ist linear. Verzweigungen und Übersichten mit mehreren Strängen bleiben Mermaid. Arbeit, die jemand erledigt, bleibt `steps`.

## Richtung {#richtung updated=2026-11-20}

Vorschlag, noch nicht entschieden: ein Codeblock `flow`, aufgebaut wie `compare`. Jeder Schritt ist eine Zeile `- Titel`, optional mit `| Badge`, darunter eingerückt die Erklärung als Markdown. Die Nummern vergibt der Renderer. `says` ist wie bei den anderen Blöcken die optionale Überschrift.

````markdown
```flow
says: Je Lieferant, Position für Position.
- Abweichung zuerst auf Datenfehler prüfen | von Hand
  Einheit, Incoterm, Menge und Mindestmenge müssen zur Baseline passen.
- Artikel in Produktkategorien gruppieren | Idee
  Kategorie heißt die Art des Produkts mit gemeinsamem Preistreiber.
- Preisentwicklung 2025 bis heute prüfen | teilweise
  Preisindizes je Kategorie und SLBs eigene Einkäufe 2026.
```
````

Gerendert als senkrechte Kette, eine Fläche ohne Karte in der Karte:

```text
  (1)  Abweichung zuerst auf Datenfehler prüfen            [von Hand]
   │   Einheit, Incoterm, Menge und Mindestmenge müssen …
   │
  (2)  Artikel in Produktkategorien gruppieren             [Idee]
   │   Kategorie heißt die Art des Produkts …
   │
  (3)  Preisentwicklung 2025 bis heute prüfen              [teilweise]
       Preisindizes je Kategorie und SLBs eigene Einkäufe 2026.
```

Kein Fortschrittsbalken, keine Zuständigen, kein Datum je Schritt. Im Druck bleibt alles sichtbar, auf GitHub erscheint der Block als lesbarer Codeblock.

## Offene Fragen {#offen updated=2026-11-20}

> [!card question yellow] Was steht im Badge eines Schritts?
> Ein freies Wort mit Farbe aus `badges:` (Idee, von Hand, gebaut, aber auch Modell oder Code), feste Arten aus dem Mermaid-Theme (Code, Modell, Mensch, Daten, Entscheidung) mit eigenem Icon, oder beides.

> [!card question grey] Braucht ein Ablauf Phasen?
> Der Bundling-Ablauf hat Abschnitte wie „Vorbereiten“ und „Anfragen“, die Prüfreihenfolge Ebenen wie Angebot, Kategorie und Position. Erst klären, wenn die Badge-Frage entschieden ist.

## Nicht jetzt

Verzweigungen, Schleifen und parallele Stränge, dafür bleibt Mermaid.
