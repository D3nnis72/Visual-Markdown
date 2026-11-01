const labels = {
  de: {
    progress: '{done} von {total} fertig', done: 'fertig', running: 'läuft',
    waiting: 'wartet', waitingFor: 'wartet auf {what}', canStart: 'kann starten',
    after: 'nach {list}', since: 'seit {when}', now: 'Jetzt möglich',
    nothingNow: 'gerade nichts', waves: 'Wellen', stand: 'Stand {date}',
    stale: 'älter als {days} Tage', errorAt: 'Fehler in steps, Zeile {line}: {message}',
    errMalformed: 'kein Schritt im Format „- [ ] kürzel: Text“',
    errField: 'unbekanntes Feld „{field}“', errNested: 'Unterpunkte kommen erst später',
    errDuplicate: 'Kürzel „{id}“ doppelt', errUnknown: '„{id}“ in nach gibt es nicht',
    errCycle: 'Zyklus über {list}',
  },
  en: {
    progress: '{done} of {total} done', done: 'done', running: 'running',
    waiting: 'waiting', waitingFor: 'waiting for {what}', canStart: 'can start',
    after: 'after {list}', since: 'since {when}', now: 'Now possible',
    nothingNow: 'nothing right now', waves: 'Waves', stand: 'As of {date}',
    stale: 'older than {days} days', errorAt: 'Error in steps, line {line}: {message}',
    errMalformed: 'not a step in the form "- [ ] id: text"',
    errField: 'unknown field "{field}"', errNested: 'sub-items are not supported yet',
    errDuplicate: 'duplicate id "{id}"', errUnknown: '"{id}" in nach does not exist',
    errCycle: 'cycle through {list}',
  },
};
export function t(lang, key, vars = {}) {
  return (labels[lang]?.[key] ?? labels.de[key] ?? key)
    .replace(/\{(\w+)\}/g, (match, name) => String(vars[name] ?? match));
}
