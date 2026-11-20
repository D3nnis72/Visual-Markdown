---
visual:
  status: Leftover
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

## Was gebaut ist {#gebaut updated=2026-11-20}

Gebaut am 20.11.: Unter jedem Mermaid-Diagramm erscheint die Legende der Knotenarten automatisch, und der Block `flow` legt Notizen je Knoten unter ein normales Mermaid-Diagramm. Das Format steht im [README unter flow](../../../README.md#flow), die Regeln für Agents in den Skills `visual-markdown` und `mermaid-theme`.

Ausgangspunkt war die Zählung der 26 Mermaid-Diagramme in `Customers/Accenture`, `LioCare` und `Onboarding-automation`: 16 davon verzweigen, unter rund 20 steht eine handgeschriebene Legende, und 4 erklären die Knoten in einer zweiten nummerierten Liste. Deshalb zeichnet Mermaid weiter die Form, und der Baustein liefert nur den Platz für Information.

## Was noch offen ist {#offen updated=2026-11-20}

```steps
- [ ] mpe: Legende und flow im echten MPE-Preview und im PDF-Export prüfen | owner: Dennis | updated: 2026-11-20
  Geprüft ist bisher nur die Vorschau aus `scripts/preview.mjs` mit Mermaid 10.9 aus dem Netz, hell und dunkel. Offen ist, ob MPE die Nummern in den Knoten, die Legende und die Notizen genauso zeigt und ob der PDF-Export sie mitnimmt. Nach `./install.sh` und „Developer: Reload Window“ `examples/bausteine.md` öffnen.
- [ ] legenden: Handgeschriebene Legenden unter den bestehenden Diagrammen entfernen | after: mpe | updated: 2026-11-20
  Rund 20 Diagramme in den Kundenordnern haben eine Legende in Worten, die jetzt doppelt erscheint. Zeilen, die nur die Knotenarten erklären, fallen weg. Erklärungen zu `ok`, `warn`, `bad` oder `accent` bleiben. Diagramme mit nummerierter Liste darunter sind Kandidaten für `flow`.
```

> [!card question grey] Braucht ein `flow` ohne Diagramm eine eigene Form?
> Bei einem rein geraden Ablauf könnte man das Diagramm weglassen, dann erscheint nur die nummerierte Liste. Erst klären, wenn sich `flow` in echten Dokumenten bewährt hat.

## Verworfen

- Ein eigener Block nur für gerade Abläufe mit selbst gezeichneten Abzweigungen: deckt die Minderheit ab, und Abzweigungen als Kacheln oder Äste sahen schlechter aus als Mermaid.
- Klick auf einen Knoten springt zur Notiz: braucht `securityLevel: loose` in Mermaid und würde damit Skripte in Diagrammen erlauben. Die Nummer reicht als Verbindung.
