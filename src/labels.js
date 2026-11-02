const labels = {
  de: {
    progress: '{done} von {total} fertig', done: 'fertig', running: 'läuft',
    group_ready: 'Kann starten', group_running: 'Läuft', group_later: 'Geplant',
    group_waiting: 'Wartet', group_done: 'Fertig', and: 'und', goal: 'Ziel', description: 'Beschreibung',
    lineNext: 'Als Nächstes', lineNeeds: 'Braucht', dependencies: 'Dependencies', identifier: 'Feste Kennung',
    copy: 'Verweis kopieren', copyStep: 'Verweis auf {id} kopieren', sectionLink: 'Zum Abschnitt', copied: 'Kopiert', thread: 'Thread',
    copyDocument: 'Verweis auf dieses Dokument kopieren', created: 'erstellt {date}', updated: 'aktualisiert {date}', noDate: 'Datum fehlt',
    waiting: 'wartet', waitingFor: 'wartet auf {what}', canStart: 'kann starten',
    after: 'nach {list}', since: 'seit {when}', now: 'Jetzt möglich',
    nothingNow: 'gerade nichts', waves: 'Wellen', stand: 'Stand {date}',
    stale: 'älter als {days} Tage', errorAt: 'Fehler in steps, Zeile {line}: {message}',
    errMalformed: 'kein Schritt im Format „- [ ] kürzel: Text“',
    errField: 'unbekanntes Feld „{field}“', errNested: 'Unterpunkte kommen erst später',
    errDuplicate: 'Kürzel „{id}“ doppelt', errUnknown: '„{id}“ in after gibt es nicht',
    errCycle: 'Zyklus über {list}',
    shareInternal: 'Intern', watermarkNote: 'nicht weitergeben',
  },
  en: {
    progress: '{done} of {total} done', done: 'done', running: 'running',
    group_ready: 'Ready', group_running: 'In progress', group_later: 'Planned',
    group_waiting: 'Waiting', group_done: 'Done', and: 'and', goal: 'Goal', description: 'Description',
    lineNext: 'Next', lineNeeds: 'Needs', dependencies: 'Dependencies', identifier: 'Stable identifier',
    copy: 'Copy reference', copyStep: 'Copy reference to {id}', sectionLink: 'Open section', copied: 'Copied', thread: 'Thread',
    copyDocument: 'Copy reference to this document', created: 'created {date}', updated: 'updated {date}', noDate: 'no date',
    waiting: 'waiting', waitingFor: 'waiting for {what}', canStart: 'can start',
    after: 'after {list}', since: 'since {when}', now: 'Now possible',
    nothingNow: 'nothing right now', waves: 'Waves', stand: 'As of {date}',
    stale: 'older than {days} days', errorAt: 'Error in steps, line {line}: {message}',
    errMalformed: 'not a step in the form "- [ ] id: text"',
    errField: 'unknown field "{field}"', errNested: 'sub-items are not supported yet',
    errDuplicate: 'duplicate id "{id}"', errUnknown: '"{id}" in after does not exist',
    errCycle: 'cycle through {list}',
    shareInternal: 'Internal', watermarkNote: 'do not share',
  },
};
export function t(lang, key, vars = {}) {
  return (labels[lang]?.[key] ?? labels.de[key] ?? key)
    .replace(/\{(\w+)\}/g, (match, name) => String(vars[name] ?? match));
}
