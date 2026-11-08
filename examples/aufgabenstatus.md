---
visual:
  created: 2026-11-08
  as-of: 2026-11-08
  status: Fortschritt und Zuständigkeit getrennt
  lang: de
---
# Aufgabenstatus und Zuständigkeit

Die Beispiele zeigen fiktive Aufgaben und Ticketverweise. Die Form zeigt den Fortschritt, Blau bedeutet bei mir, Violett abgegeben und Grau neutral. Der Ticketstatus bleibt auch dann sichtbar, wenn lokal noch ein Nachtest offen ist.

```steps
- [ ] own: Konzept ausarbeiten | workflow: todo | responsibility: self | owner: Ich | priority: P1 | status: Die Anforderungen sind geklärt. Der Entwurf ist der nächste eigene Schritt. | next: Entwurf ausarbeiten | updated: 2026-11-08
  Die Oberfläche braucht einen abgestimmten Ablauf, bevor die Umsetzung beginnt.
- [ ] handed: Fehlende Bestätigung ergänzen | workflow: todo | responsibility: delegated | owner: Kollegin | priority: P1 | ticket: [EX-1](https://linear.app/example/issue/EX-1) | ticket-status: Todo | ticket-owner: Kollegin | status: Das Ticket ist zugewiesen, die Umsetzung hat noch nicht begonnen. | next: Kollegin übernimmt die Umsetzung | updated: 2026-11-08
  Nach erfolgreichem Speichern soll eine sichtbare Bestätigung erscheinen.
- [~] work: Eigene Umsetzung | workflow: in-progress | responsibility: self | owner: Ich | priority: P2 | status: Ich bearbeite die Rückmeldung. | updated: 2026-11-08
  Die Korrektur muss den beschriebenen Ablauf erhalten.
- [~] other-work: Abgegebene Umsetzung | workflow: in-progress | responsibility: delegated | owner: Kollege | priority: P2 | status: Der Kollege setzt die Korrektur um. | updated: 2026-11-08
  Die gleiche Fortschrittsform hat wegen der Zuständigkeit eine andere Farbe.
- [~] review: Änderung prüfen lassen | workflow: review | responsibility: delegated | owner: Kollegin | priority: P2 | status: Die Änderung wartet auf das laufende Review. | updated: 2026-11-08
  Die Umsetzung muss die vereinbarte Wirkung erfüllen.
- [ ] verify: Ausgelieferten Fix nachtesten | workflow: todo | responsibility: self | owner: Ich | priority: P2 | ticket: [EX-2](https://linear.app/example/issue/EX-2) | ticket-status: Staging | ticket-owner: Kollege | status: Der Fix ist auf Staging, mein Funktionstest steht aus. | next: Geänderten Ablauf nachtesten | updated: 2026-11-08
  Ein abgeschlossenes Umsetzungsticket bestätigt noch keinen bestandenen Funktionstest.
- [ ] neutral: Beobachtung einordnen | workflow: backlog | responsibility: unassigned | priority: P3 | status: Ursache und zuständige Person sind noch offen. | updated: 2026-11-08
  Die Beobachtung muss erst konkret eingegrenzt werden.
- [!] paused: Rückmeldung abwarten | workflow: on-hold | responsibility: delegated | owner: Kunde | waiting-for: Fehlender Beispieldatensatz | priority: P3 | status: Ohne die Beispieldaten lässt sich der Fall nicht nachstellen. | updated: 2026-11-08
  Der Kunde liefert die fehlende Grundlage.
- [x] done: Ergebnis abgenommen | workflow: done | responsibility: self | owner: Ich | status: Der vereinbarte Test ist bestanden. | updated: 2026-11-08
- [ ] canceled: Ansatz verworfen | workflow: canceled | responsibility: unassigned | status: Der Ansatz wird nicht umgesetzt. | updated: 2026-11-08
- [ ] duplicate: Doppelten Eintrag schließen | workflow: duplicate | responsibility: unassigned | status: Die Arbeit gehört zum anderen Eintrag. | updated: 2026-11-08
```
