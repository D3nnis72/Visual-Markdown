import test from 'node:test';
import assert from 'node:assert/strict';
import { transform } from '../src/core.js';
const fence = body => '```steps\n' + body + '\n```';
const run = body => transform(fence(body));
const example = '- [x] basis: Datenbasis vorbereiten\n- [~] run: Anreicherung ausführen | after: basis | done-when: Stichprobe geprüft | owner: Team\n- [ ] review: Stichprobe prüfen | after: run\n- [!] approval: Freigabe einholen | waiting-for: Rückmeldung\n- [ ] publish: Ergebnisse übernehmen | after: review, approval\n- [ ] docs: Dokumentation vorbereiten';
const row = (html, id) => html.match(new RegExp(`<li id="[^" ]*-${id}"[^>]*>[\\s\\S]*?</li>`))[0];
const caption = (label, text) => new RegExp(`class="vm-caption"><svg class="vm-caption-icon"[^>]*>[\\s\\S]*?</svg>${label}</div><div class="vm-field-text">${text}`);

test('groups rows once in ready, running, planned, waiting, done order with counts', () => {
  const html = run(example);
  const groups = [...html.matchAll(/class="vm-group vm-group-([^" ]+)"/g)].map(match => match[1]);
  assert.deepEqual(groups, ['ready', 'running', 'later', 'waiting', 'done']);
  const ids = [...html.matchAll(/<li id="vm-steps-1-([^" ]+)"/g)].map(match => match[1]);
  assert.deepEqual(ids, ['docs', 'run', 'review', 'publish', 'approval', 'basis']);
  assert.match(html, /<h3 class="vm-group-title"><svg class="vm-group-icon vm-icon-later"[^>]*>[\s\S]*?<\/svg>Backlog<span class="vm-group-count">2<\/span><\/h3>/);
  assert.doesNotMatch(html, /vm-number|<ol/);
});
test('shows status icon, id tag above the title and a one-line description', () => {
  const item = row(run('- [~] run: Ausführen | owner: Team\n  Wir ergänzen <fehlende> Angaben, damit `Preise` vergleichbar sind.'), 'run');
  assert.match(item, /<svg class="vm-status-icon vm-icon-running"/);
  assert.match(item, /<div class="vm-row-main"><div class="vm-label">Ausführen<\/div><div class="vm-summary">Wir ergänzen &lt;fehlende&gt; Angaben, damit <code>Preise<\/code> vergleichbar sind.<\/div>/);
});
test('opens description, next action and goal in native details', () => {
  const item = row(run('- [~] run: A | next: Stichprobe ziehen | done-when: Stichprobe geprüft\n  Volle Beschreibung'), 'run');
  assert.match(item, /<details class="vm-row-details"><summary class="vm-row">/);
  const body = item.slice(item.indexOf('vm-row-body'));
  assert.match(body, caption('Beschreibung', 'Volle Beschreibung'));
  assert.match(body, caption('Als Nächstes', 'Stichprobe ziehen'));
  assert.match(body, caption('Ziel', 'Stichprobe geprüft'));
  assert.ok(body.indexOf('vm-field-description') < body.indexOf('vm-field-next'));
  assert.ok(body.indexOf('vm-field-next') < body.indexOf('vm-field-goal'));
});
test('renders a plain row without details when there is nothing to open', () => {
  const item = row(run('- [x] a: A | done-when: geprüft'), 'a');
  assert.doesNotMatch(item, /<details|vm-field-goal/);
  assert.match(item, /<div class="vm-row">/);
});
test('links a step to the section with the same id', () => {
  const html = transform('## Badges {#badges updated=2026-11-01}\n\n' + fence('- [ ] badges: Badges bauen\n- [ ] other: Anderes'));
  assert.match(row(html, 'badges'), /<a class="vm-section-link" href="#vm-section-badges">[\s\S]*?Zum Abschnitt<\/a>/);
  assert.doesNotMatch(row(html, 'other'), /vm-section-link|<details/);
});
test('shows the waiting reason with its date in the row', () => {
  const item = row(run('- [!] a: A | waiting-for: Rückmeldung | since: 30. Oktober | updated: 2026-11-01'), 'a');
  assert.match(item.slice(0, item.indexOf('vm-meta')), /<div class="vm-need">[\s\S]*?<\/svg>Rückmeldung, seit 30. Oktober<\/div>/);
  assert.doesNotMatch(item, /vm-since/);
  assert.match(row(run('- [ ] a: A | waiting-for: Rückmeldung'), 'a'), /vm-waiting/);
});
test('names dependencies by id, links them and colors them like their target', () => {
  const html = run('- [~] a: A\n- [!] b: B | waiting-for: X\n- [ ] c: C\n- [ ] d: D | after: c\n- [ ] e: E | after: a, b, d');
  const deps = [...row(html, 'e').matchAll(/<a href="#vm-steps-1-([a-z]+)" class="vm-dep vm-ref-([a-z-]+)"[^>]*>[\s\S]*?<\/svg>\1<\/a>/g)].map(match => `${match[1]}:${match[2]}`);
  assert.deepEqual(deps, ['a:running', 'b:waiting', 'd:open']);
  assert.match(row(html, 'd'), /class="vm-dep vm-ref-can-start"/);
  assert.doesNotMatch(row(run('- [x] a: A\n- [ ] b: B | after: a'), 'b'), /vm-dep/);
});
test('keeps anchor targets unique across blocks with the same ids', () => {
  const html = transform(fence('- [ ] a: A') + '\n\n' + fence('- [ ] a: A'));
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 2);
  assert.equal(new Set(ids).size, 2);
});
test('translates labels and escapes text and attributes', () => {
  const html = transform('---\nvisual:\n  lang: en\n---\n' + fence('- [~] a: <img> "A" | done-when: `ok`\n- [ ] b: B | after: a'));
  assert.match(html, /Backlog<span/);
  assert.match(html, caption('Goal', '<code>ok</code>'));
  assert.match(html, /&lt;img&gt; &quot;A&quot;/);
  assert.doesNotMatch(html, /<img>/);
});
test('marks agent owners and shows the thread title', () => {
  const html = run('- [~] a: A | owner: Agent | thread: [Thread: Anreicherung ausführen; ref=thread_abc-123]\n- [ ] b: B | owner: Team');
  assert.match(row(html, 'a'), /<span class="vm-badge vm-owner vm-agent"[^>]*><svg class="vm-agent-icon"[\s\S]*?<\/svg>Agent<\/span>/);
  assert.match(row(html, 'a'), /<span class="vm-badge vm-thread"[^>]*><svg class="vm-thread-icon"[\s\S]*?<\/svg>Anreicherung ausführen<\/span>/);
  assert.match(row(html, 'a'), /data-copy-thread="\[Thread: Anreicherung ausführen; ref=thread_abc-123\]"/);
  assert.match(row(html, 'b'), /<span class="vm-badge vm-owner"[^>]*><svg class="vm-person-icon"[\s\S]*?<\/svg>Team<\/span>/);
});
test('puts the copy button in the row between badges and chevron', () => {
  const item = row(run('- [~] run: A | next: B'), 'run');
  assert.match(item, /<\/div><button type="button" class="vm-copy" data-copy-id="run" data-copied="Kopiert" title="Verweis kopieren" aria-label="Verweis auf run kopieren">[\s\S]*?<\/button><span class="vm-chevron">/);
});
test('shows when a step was last updated and flags old or missing dates', () => {
  const today = new Date(2026, 10, 1);
  const html = transform(fence('- [~] a: A | updated: 2026-11-01\n- [ ] b: B | updated: 2026-10-20\n- [ ] c: C'), { today });
  assert.match(row(html, 'a'), /<span class="vm-badge vm-updated" title="aktualisiert 1. Nov."><svg class="vm-updated-icon"[\s\S]*?<\/svg>1. Nov.<\/span>/);
  assert.match(row(html, 'b'), /class="vm-badge vm-updated vm-date-stale"/);
  assert.match(row(html, 'c'), /class="vm-badge vm-updated vm-date-missing"/);
});
test('reports progress and keeps an empty list readable', () => {
  assert.match(run(example), /1 von 6 fertig/);
  assert.match(run(''), /0 von 0 fertig/);
});

test('groups by priority when a block uses it, keeps the status icon and opens P1', () => {
  const html = run('- [ ] later: L | priority: P3\n  W\n- [x] old: O | priority: P1\n- [~] urgent: U | priority: P1 | next: Prüfen | see: [Thema](01_x.md#a)\n  Weil es eilt.\n- [ ] plain: N\n  W\n- [ ] mid: M | priority: P2 | next: Später prüfen\n  W');
  const groups = [...html.matchAll(/class="vm-group vm-group-([^" ]+)"/g)].map(match => match[1]);
  assert.deepEqual(groups, ['p1', 'p2', 'p3', 'none', 'done']);
  assert.match(html, /<svg class="vm-group-icon vm-icon-p1"[^>]*>[\s\S]*?<\/svg>P1 · Dringend<span class="vm-group-count">1</);
  const urgent = row(html, 'urgent');
  assert.match(urgent, /<details class="vm-row-details" open>/);
  assert.match(urgent, /vm-status-icon vm-icon-running/);
  assert.match(urgent, caption('Beschreibung', 'Weil es eilt\\.'));
  assert.match(urgent, caption('Mehr dazu', '<a href="01_x\\.md#a">Thema</a>'));
  // P2 shows its next step although it is only planned, but stays closed.
  const mid = row(html, 'mid');
  assert.match(mid, /<details class="vm-row-details"><summary/);
  assert.match(mid, caption('Als Nächstes', 'Später prüfen'));
  assert.doesNotMatch(row(html, 'old'), / open>/);
});

test('keeps current status and its ticket link in the visible row, separate from Description', () => {
  const item = row(run('- [~] a: Fix | status: [Ticket](https://example.com/123) assigned; retest pending | priority: P1\n  Wrong dates confuse suppliers.'), 'a');
  const summary = item.slice(0, item.indexOf('</summary>'));
  assert.match(summary, /class="vm-current-status"/);
  assert.match(summary, /Aktueller Stand:/);
  assert.match(summary, /href="https:\/\/example.com\/123"/);
  assert.match(item.slice(item.indexOf('vm-row-body')), caption('Beschreibung', 'Wrong dates confuse suppliers\\.'));
});
test('shows the computed state when no current status was written', () => {
  assert.match(row(run('- [ ] a: A'), 'a'), /Aktueller Stand:<\/span> Todo/);
  const html = transform('---\nvisual:\n  lang: en\n---\n' + fence('- [~] a: A'));
  assert.match(row(html, 'a'), /Current status:<\/span> In Progress/);
});


test('uses Description for prioritized English rows too', () => {
  const html = transform('---\nvisual:\n  lang: en\n---\n' + fence('- [ ] a: A | priority: P1\n  Context'));
  assert.match(row(html, 'a'), caption('Description', 'Context'));
  assert.doesNotMatch(row(html, 'a'), />Why<|>Warum</);
});
