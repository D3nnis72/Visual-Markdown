# Linear automatisch abgleichen

Ein Schritt kann seine Ticketdaten automatisch aus Linear übernehmen. Dafür einmal den lokalen Dienst einrichten und am gewünschten Todo `ticket-sync: true` ergänzen:

```text
- [ ] fix: Fehler beheben | ticket: [ASK-123](https://linear.app/lio/issue/ASK-123) | ticket-sync: true
```

Die Zeile gehört in einen normalen `steps`-Block. Der Dienst durchsucht die konfigurierten Projektordner alle fünf Minuten und beim Start. Auch neue Dateien werden gefunden. `ticket-sync: false` oder Entfernen der Markierung beendet den Abgleich für diesen Schritt. Ein Link allein aktiviert ihn nicht.

Linear liefert `ticket-status` und `ticket-owner`. Ohne Zuweisung entfernt der Dienst einen alten `ticket-owner`. `ticket-checked` hält das Datum des letzten erfolgreichen Abrufs fest. Das Prüfdatum steht nur im Markdown, während die vorhandene Vorschau den Ticketstatus und Ticketverantwortlichen bei Abweichungen vom lokalen Stand zeigt.

Der lokale Arbeitsschritt bleibt separat: Checkbox, Fortschritt, Zuständigkeit, Beschreibung, Statustext, nächste Aktion und Abschlussbedingung werden nicht automatisch geändert. Ein erledigtes Ticket schließt deshalb keinen noch offenen Nachtest ab. Auch `updated` und `visual.as-of` bleiben unverändert, weil ein Ticketabruf keinen neuen lokalen Test belegt. Unveränderte Ticketdaten werden am gleichen Tag nicht erneut geschrieben.

## Einmal einrichten

Benötigt werden Node ab Version 20, ein lesender Linear-API-Schlüssel und für den Dienst macOS. Der Renderer selbst bleibt offline und benötigt keinen Schlüssel. Die [Linear-Dokumentation](https://linear.app/docs/api-and-webhooks) erklärt API-Schlüssel mit auf Lesen und bestimmte Teams eingeschränkten Rechten.

Im eigenen Benutzerordner `~/.config/visual-markdown/` mit Rechten `0700` anlegen. Dort den Schlüssel als `linear-api-key` speichern, mit Rechten `0600`, ohne ihn in Markdown, Git oder Befehlsargumente zu schreiben. Im selben privaten Verzeichnis die Datei `linear-sync.json` mit Rechten `0600` anlegen:

```json
{
  "targets": ["/absoluter/pfad/zu/deinen/Projekten"],
  "keyFile": "/absoluter/pfad/im/benutzerordner/.config/visual-markdown/linear-api-key"
}
```

Alle Pfade müssen absolut sein, `~` wird innerhalb von JSON nicht expandiert. `targets` kann ganze Projektordner enthalten, weil nur explizit markierte Schritte abgeglichen werden. Dateien sind ebenfalls erlaubt. Symlinks, versteckte Unterordner, `node_modules`, `dist` und `build` werden nicht durchsucht. Ungültige markierte Blöcke bleiben unverändert und erzeugen einen Fehler im Log.

Aus dem Visual-Markdown-Repository zuerst prüfen, welche Dateien sich ändern würden:

```bash
npm run linear-sync -- --dry-run
```

Der Vorschauaufruf liest die echten Ticketdaten, verändert aber keine Markdown-Dateien. Anschließend den Dienst starten:

```bash
npm run linear-service -- install
```

Die Installation startet einen Abruf und danach alle 300 Sekunden einen weiteren, solange der Benutzer angemeldet und der Rechner aktiv ist. Nach Ruhezustand oder ohne Internet kann der Stand verzögert sein. Die vorhandene Markdown-Vorschau liest die gespeicherten Änderungen. Nach dem erstmaligen Aktualisieren des Parsers kann in VS Code `Developer: Reload Window` nötig sein.

## Prüfen und verwalten

```bash
npm run linear-sync
npm run linear-sync -- --config /absoluter/pfad/linear-sync.json --dry-run
launchctl print gui/$(id -u)/de.visual-markdown.linear-sync
```

Erfolgreiche Durchläufe protokollieren geprüfte Tickets, geänderte Dateien und Fehler. Die Logs liegen unter `~/Library/Logs/visual-markdown/linear-sync.log` und `linear-sync-error.log`. Dateien über 1 MiB werden vor dem nächsten Dienstlauf geleert. Der Dienst lädt die Schlüsseldatei bei jedem Lauf neu, deshalb reicht beim Schlüsselwechsel ein Austausch der Datei unter Beibehaltung ihrer privaten Rechte.

Einmalige interaktive Abrufe können alternativ `LINEAR_API_KEY` aus ihrer Prozessumgebung lesen. Der Dienst benötigt die Schlüsseldatei. Konfiguration und Schlüssel bleiben außerhalb des Repositories. Andere Betriebssysteme können das Einmalkommando mit ihrem eigenen Zeitplaner aufrufen.

```bash
npm run linear-service -- uninstall
```

Die Deinstallation entfernt nur den Dienst. Markdown-Dateien, Konfiguration und Schlüssel bleiben erhalten.

## Verhalten bei Fehlern

Fehlende Tickets, API-Fehler oder fehlendes Internet erhalten den letzten belegten Stand samt Prüfdatum. Andere erfolgreich gelesene Tickets können trotzdem aktualisiert werden. Zugriffsfehler und API-Limits beenden weitere Anfragen im aktuellen Lauf. Der nächste geplante Lauf versucht es erneut. Fehlermeldungen geben keine Schlüssel oder ungeprüften Servertexte aus. Exitcode `0` bedeutet Erfolg, `1` Fehler im Abgleich und `2` falsche Konfiguration oder Aufrufparameter.

Eine gemeinsame Sperre verhindert parallele Kommandos derselben Konfiguration. Der Dienst vergleicht eine Datei unmittelbar vor dem atomaren Ersetzen noch einmal mit ihrem ursprünglichen Stand. Änderungen während des API-Abrufs werden dadurch nicht überschrieben. Zwischen dem letzten Vergleich und dem Ersetzen bleibt ein sehr kurzes Zeitfenster für konkurrierende Editorzugriffe. Ungespeicherte Änderungen im Editor können nicht erkannt werden. Den Dienst bei längeren ungespeicherten Überarbeitungen gegebenenfalls vorübergehend deinstallieren und danach erneut installieren.
