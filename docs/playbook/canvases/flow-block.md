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

Abgrenzung, Vorschlag: Bei Mermaid ist die Form die Aussage, bei `flow` der Text. Mermaid nimmt man, wenn der Leser vor allem sehen soll, wie Dinge zusammenhängen: mehrere Stränge mit eigenen Schritten, Pfade, die wieder zusammenlaufen, Schleifen, Übersichten mit kurzen Knotennamen. `flow` nimmt man, wenn es einen Hauptweg von oben nach unten gibt und jeder Schritt einen Satz Erklärung braucht. Arbeit, die jemand erledigt, bleibt `steps`.

## Richtung {#richtung updated=2026-11-20}

Vorschlag, noch nicht entschieden: ein Codeblock `flow`, aufgebaut wie `compare`, in drei Stufen, die man nur bei Bedarf nutzt.

1. Schritte: `- Titel | Badge`, darunter eingerückt die Erklärung als Markdown. Die Nummern vergibt der Renderer.
2. Phasen: eine Zeile `## Name` im Block setzt eine kleine Zwischenüberschrift auf die Linie, etwa Angebot, Kategorie, Position.
3. Eine Entscheidung: Ein Schritt, dessen Titel mit `?` endet, wird zur Raute. Seine Ausgänge stehen eingerückt als `-> Name: Erklärung` und erscheinen nebeneinander. Ein Ausgang endet dort oder sagt mit `→ Ziel`, wohin es geht. Danach läuft der Hauptweg weiter.

Was darüber hinausgeht, ist Mermaid: Ausgänge mit eigenen mehreren Schritten, verschachtelte Entscheidungen, Rücksprünge, parallele Stränge. Der Checker meldet das nicht als Fehler, die Syntax lässt es einfach nicht zu.

````markdown
```flow
says: Je Lieferant, Position für Position.
## Angebot
- Abweichung zuerst auf Datenfehler prüfen | von Hand
  Einheit, Incoterm, Menge und Mindestmenge müssen zur Baseline passen.
- Artikel in Produktkategorien gruppieren | Idee
  Kategorie heißt die Art des Produkts mit gemeinsamem Preistreiber.
## Position
- Was machen wir mit der Position? | Idee
  Den Zielpreis ändern darf nur der SLB Category Owner (E32).
  -> Verhandeln: Erhöhung nicht erklärt, kein zweiter Lieferant.
  -> Annehmen: Erhöhung erklärt oder Spend zu klein.
  -> Zurückstellen: SLB kauft den Artikel auch woanders. → spätere Wave
```
````

Gerendert als senkrechte Linie mit nummerierten Kreisen, Phasen als kleine Großbuchstaben auf der Linie, die Entscheidung als Raute mit Ausgängen als Kacheln darunter. Eine Fläche, keine Karte in der Karte, kein Fortschritt, keine Zuständigen, kein Datum je Schritt. Auf schmalen Fenstern stehen die Ausgänge untereinander. Im Druck bleibt alles sichtbar, auf GitHub erscheint der Block als lesbarer Codeblock. Ein HTML-Entwurf liegt im Chat vom 20.11.

## Offene Fragen {#offen updated=2026-11-20}

> [!card question yellow] Was steht im Badge eines Schritts?
> Ein freies Wort mit Farbe aus `badges:` (Idee, von Hand, gebaut, aber auch Modell oder Code), feste Arten aus dem Mermaid-Theme (Code, Modell, Mensch, Daten, Entscheidung) mit eigenem Icon, oder beides.

> [!card question grey] Reicht eine Entscheidungsebene?
> Vorschlag ist genau eine Ebene mit Ausgängen, die enden oder auf ein Ziel zeigen. Offen, ob es Fälle gibt, in denen ein Ausgang zwei eigene Schritte braucht und Mermaid dafür zu schwer wäre.

## Nicht jetzt

Verschachtelte Entscheidungen, Ausgänge mit eigenen Schrittfolgen, Schleifen und parallele Stränge, dafür bleibt Mermaid.
