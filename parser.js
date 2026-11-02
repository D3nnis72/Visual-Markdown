(() => {
// Generated from src/ by npm run build. Do not edit.
var __visualMarkdown = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/parser-entry.js
  var parser_entry_exports = {};
  __export(parser_entry_exports, {
    default: () => parser_entry_default
  });

  // src/frontmatter.js
  function readVisual(markdown) {
    const lines = markdown.split(/\r?\n/);
    if (lines[0] !== "---") return { visual: null, endLine: -1 };
    const endLine = lines.findIndex((line, i) => i > 0 && line === "---");
    if (endLine < 0) return { visual: null, endLine: -1 };
    let visual = null;
    let inVisual = false;
    for (const line of lines.slice(1, endLine)) {
      if (line === "visual:") {
        visual = {};
        inVisual = true;
        continue;
      }
      if (line && !line.startsWith(" ")) inVisual = false;
      if (!inVisual) continue;
      const match = /^ {2}([^\s:][^:]*):\s*(.*?)\s*$/.exec(line);
      if (match) {
        const value = match[2].replace(/^(["'])(.*)\1$/, "$2");
        visual[match[1]] = value;
      }
    }
    return { visual, endLine };
  }

  // src/html.js
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }
  function inline(value) {
    const escaped = escapeHtml(value);
    return escaped.replace(/`([^`]+)`|\[([^\]]+)\]\(([^\s)]+)\)/g, (match, code, label, url) => {
      if (code !== void 0) return `<code>${code}</code>`;
      if (/^(?:[a-z][a-z0-9+.-]*:)/i.test(url) && !/^(?:https?:|mailto:)/i.test(url)) return match;
      return `<a href="${url}">${label}</a>`;
    });
  }

  // src/labels.js
  var labels = {
    de: {
      progress: "{done} von {total} fertig",
      done: "fertig",
      running: "l\xE4uft",
      group_ready: "Kann starten",
      group_running: "L\xE4uft",
      group_later: "Geplant",
      group_waiting: "Wartet",
      group_done: "Fertig",
      and: "und",
      goal: "Ziel",
      description: "Beschreibung",
      lineNext: "Als N\xE4chstes",
      lineNeeds: "Braucht",
      dependencies: "Dependencies",
      identifier: "Feste Kennung",
      copy: "Verweis kopieren",
      copyStep: "Verweis auf {id} kopieren",
      sectionLink: "Zum Abschnitt",
      copied: "Kopiert",
      thread: "Thread",
      copyDocument: "Verweis auf dieses Dokument kopieren",
      created: "erstellt {date}",
      updated: "aktualisiert {date}",
      noDate: "Datum fehlt",
      waiting: "wartet",
      waitingFor: "wartet auf {what}",
      canStart: "kann starten",
      after: "nach {list}",
      since: "seit {when}",
      now: "Jetzt m\xF6glich",
      nothingNow: "gerade nichts",
      waves: "Wellen",
      stand: "Stand {date}",
      stale: "\xE4lter als {days} Tage",
      errorAt: "Fehler in {block}, Zeile {line}: {message}",
      errMalformed: "kein Schritt im Format \u201E- [ ] k\xFCrzel: Text\u201C",
      errField: "unbekanntes Feld \u201E{field}\u201C",
      errNested: "Unterpunkte kommen erst sp\xE4ter",
      errDuplicate: "K\xFCrzel \u201E{id}\u201C doppelt",
      errUnknown: "\u201E{id}\u201C in after gibt es nicht",
      errCycle: "Zyklus \xFCber {list}",
      shareInternal: "Intern",
      watermarkNote: "nicht weitergeben",
      chartBasis: "Grundlage",
      chartSource: "Quelle",
      chartOther: "Sonstige",
      chartTotal: "Summe",
      chartUp: "Zunahme",
      chartDown: "Abnahme",
      chartShare: "Anteil",
      chartCumulative: "kumuliert",
      errSeries: "ein Streudiagramm zeigt h\xF6chstens {max} Farben",
      checkNoVisual: "kein `visual:` im Frontmatter",
      checkMissing: "`{field}` fehlt unter `visual:`",
      checkBadDate: "\u201E{value}\u201C ist kein Datum im Format JJJJ-MM-TT",
      checkStale: "{what} ist \xE4lter als {days} Tage ({date})",
      checkShare: "Datei liegt unter Customers/, aber `share: intern` fehlt",
      checkShareValue: "`share: {value}` kennt der Renderer nicht, gemeint ist wohl `intern`",
      checkSectionDate: "Abschnitt `{id}` hat kein `updated=`",
      checkSectionDuplicate: "Kennung `{id}` gibt es zweimal",
      checkStepDate: "Schritt `{id}` hat kein `updated`",
      checkStepDescription: "Schritt `{id}` hat keine Beschreibung in der Zeile darunter",
      checkCardWord: "`{word}` ist weder Icon noch Farbe einer Karte",
      checkBadge: "Badge-Farbe `{color}` gibt es nicht, erlaubt sind {list}",
      checkAsOfOld: "`as-of` ist \xE4lter als das neueste `updated` ({date})",
      errRequired: "Pflichtfeld \u201E{field}\u201C fehlt",
      errValue: "\u201E{value}\u201C geht nicht f\xFCr {field}, erlaubt sind {list}",
      errNoTable: "keine Tabelle direkt \xFCber dem Block",
      errColumn: "Spalte \u201E{column}\u201C gibt es in der Tabelle nicht",
      errColorMulti: "color geht nur mit einer Spalte in y",
      errNumber: "\u201E{value}\u201C in {column} ist keine Zahl"
    },
    en: {
      progress: "{done} of {total} done",
      done: "done",
      running: "running",
      group_ready: "Ready",
      group_running: "In progress",
      group_later: "Planned",
      group_waiting: "Waiting",
      group_done: "Done",
      and: "and",
      goal: "Goal",
      description: "Description",
      lineNext: "Next",
      lineNeeds: "Needs",
      dependencies: "Dependencies",
      identifier: "Stable identifier",
      copy: "Copy reference",
      copyStep: "Copy reference to {id}",
      sectionLink: "Open section",
      copied: "Copied",
      thread: "Thread",
      copyDocument: "Copy reference to this document",
      created: "created {date}",
      updated: "updated {date}",
      noDate: "no date",
      waiting: "waiting",
      waitingFor: "waiting for {what}",
      canStart: "can start",
      after: "after {list}",
      since: "since {when}",
      now: "Now possible",
      nothingNow: "nothing right now",
      waves: "Waves",
      stand: "As of {date}",
      stale: "older than {days} days",
      errorAt: "Error in {block}, line {line}: {message}",
      errMalformed: 'not a step in the form "- [ ] id: text"',
      errField: 'unknown field "{field}"',
      errNested: "sub-items are not supported yet",
      errDuplicate: 'duplicate id "{id}"',
      errUnknown: '"{id}" in after does not exist',
      errCycle: "cycle through {list}",
      shareInternal: "Internal",
      watermarkNote: "do not share",
      chartBasis: "Based on",
      chartSource: "Source",
      chartOther: "Other",
      chartTotal: "Total",
      chartUp: "Increase",
      chartDown: "Decrease",
      chartShare: "Share",
      chartCumulative: "cumulative",
      errSeries: "a scatter chart shows at most {max} colors",
      checkNoVisual: "no `visual:` in the front matter",
      checkMissing: "`{field}` is missing under `visual:`",
      checkBadDate: '"{value}" is not a date in the form YYYY-MM-DD',
      checkStale: "{what} is older than {days} days ({date})",
      checkShare: "file is under Customers/ but `share: intern` is missing",
      checkShareValue: "the renderer does not know `share: {value}`, use `intern`",
      checkSectionDate: "section `{id}` has no `updated=`",
      checkSectionDuplicate: "id `{id}` is used twice",
      checkStepDate: "step `{id}` has no `updated`",
      checkStepDescription: "step `{id}` has no description on the line below",
      checkCardWord: "`{word}` is neither an icon nor a color of a card",
      checkBadge: "badge color `{color}` does not exist, use {list}",
      checkAsOfOld: "`as-of` is older than the newest `updated` ({date})",
      errRequired: 'required field "{field}" is missing',
      errValue: '"{value}" is not allowed for {field}, use {list}',
      errNoTable: "no table directly above the block",
      errColumn: 'the table has no column "{column}"',
      errColorMulti: "color works only with one column in y",
      errNumber: '"{value}" in {column} is not a number'
    }
  };
  function t(lang, key, vars = {}) {
    return (labels[lang]?.[key] ?? labels.de[key] ?? key).replace(/\{(\w+)\}/g, (match, name) => String(vars[name] ?? match));
  }

  // src/icons.js
  var svg = (className, size, shapes) => `<svg class="${className}" viewBox="0 0 16 16" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shapes}</svg>`;
  var AGENT_ICON = svg("vm-agent-icon", 13, '<rect x="2.75" y="5" width="10.5" height="8" rx="2.25"/><path d="M8 5V2.75M6 8.75v.5M10 8.75v.5"/>');
  var COPY_ICON = svg("vm-copy-icon", 15, '<g class="vm-copy-idle"><rect x="5.25" y="5.25" width="8.5" height="8.5" rx="1.75"/><path d="M10.75 5.25V4A1.75 1.75 0 0 0 9 2.25H4A1.75 1.75 0 0 0 2.25 4v5A1.75 1.75 0 0 0 4 10.75h1.25"/></g><path class="vm-copy-done" d="m3.5 8.25 3 3 6-6.5"/>');
  var PERSON_ICON = svg("vm-person-icon", 13, '<circle cx="8" cy="5.5" r="2.75"/><path d="M2.75 13.75c.6-2.6 2.75-4 5.25-4s4.65 1.4 5.25 4"/>');
  var TAG_ICON = svg("vm-tag-icon", 13, '<path d="M2.25 3.25v4.6a1 1 0 0 0 .3.7l5.2 5.2a1 1 0 0 0 1.4 0l4.4-4.4a1 1 0 0 0 0-1.4l-5.2-5.2a1 1 0 0 0-.7-.3h-4.6a.8.8 0 0 0-.8.8z"/><circle cx="5.25" cy="5.25" r=".75" fill="currentColor" stroke="none"/>');
  var UPDATED_ICON = svg("vm-updated-icon", 13, '<path d="M13.25 8A5.25 5.25 0 1 1 11.7 4.3"/><path d="M13.25 2.5v3h-3"/>');
  var THREAD_ICON = svg("vm-thread-icon", 13, '<path d="M2.75 4.25a1.5 1.5 0 0 1 1.5-1.5h7.5a1.5 1.5 0 0 1 1.5 1.5v5.5a1.5 1.5 0 0 1-1.5 1.5H6.5l-3.75 2.5z"/>');
  var SINCE_ICON = svg("vm-since-icon", 13, '<circle cx="8" cy="8" r="6.25"/><path d="M8 5v3.25l2.1 1.3"/>');
  var CAPTION_ICONS = {
    description: svg("vm-caption-icon", 12, '<path d="M2.75 4h10.5M2.75 8h10.5M2.75 12h6.5"/>'),
    needs: svg("vm-caption-icon", 12, '<circle cx="8" cy="8" r="6.25"/><path d="M8 4.75v3.75M8 11.1v.15"/>'),
    next: svg("vm-caption-icon", 12, '<path d="M2.75 8h10.5M9.25 4l4 4-4 4"/>'),
    dependencies: svg("vm-caption-icon", 12, '<path d="M3.75 2.75v4.5a2.5 2.5 0 0 0 2.5 2.5h7M10 6.5l3.25 3.25L10 13"/>'),
    goal: svg("vm-caption-icon", 12, '<path d="M3.75 14V2.5M3.75 3h8.5l-2 3 2 3h-8.5"/>')
  };
  var DEPENDENCY_ICON = svg("vm-dep-icon", 12, '<path d="M3.75 2.75v4.5a2.5 2.5 0 0 0 2.5 2.5h7M10 6.5l3.25 3.25L10 13"/>');
  var SECTION_ICON = svg("vm-section-icon", 13, '<path d="M4 2.25h5.5L12.75 5.5v8.25H4z"/><path d="M9.25 2.25v3.5h3.5"/>');
  var CHEVRON_ICON = svg("vm-chevron-icon", 14, '<path d="m6 4 4 4-4 4"/>');

  // src/dates.js
  var STALE_DAYS = 7;
  var months = {
    de: ["Januar", "Februar", "M\xE4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };
  var shortMonths = {
    de: ["Jan.", "Feb.", "M\xE4rz", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  };
  function parseDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
    if (!match) return null;
    const [, year, month, day] = match.map(Number);
    const timestamp = Date.UTC(year, month - 1, day);
    const parsed = new Date(timestamp);
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return null;
    return { year, month, day, timestamp };
  }
  function formatDate(date, lang, { short = false, today = null } = {}) {
    const language = lang === "en" ? "en" : "de";
    if (!short) return `${date.day}${language === "de" ? "." : ""} ${months[language][date.month - 1]} ${date.year}`;
    const name = shortMonths[language][date.month - 1];
    const otherYear = today && today.getFullYear() !== date.year;
    if (language === "en") return `${name} ${date.day}${otherYear ? `, ${date.year}` : ""}`;
    return `${date.day}. ${name}${otherYear ? ` ${date.year}` : ""}`;
  }
  function isStale(date, today) {
    return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - date.timestamp > STALE_DAYS * 864e5;
  }

  // src/meta.js
  var badge = (className, icon2, content, title) => `<span class="vm-badge ${className}"${title ? ` title="${escapeHtml(title)}"` : ""}>${icon2}${content}</span>`;
  var idBadge = (id, lang) => badge("vm-id-badge", TAG_ICON, `<code class="vm-id" title="${escapeHtml(t(lang, "identifier"))}">${escapeHtml(id)}</code>`);
  function updatedBadge(value, lang, today) {
    if (!value) return badge("vm-updated vm-date-missing", UPDATED_ICON, escapeHtml(t(lang, "noDate")), t(lang, "noDate"));
    const date = parseDate(value);
    const shown = date ? formatDate(date, lang, { short: true, today }) : value;
    const title = t(lang, "updated", { date: shown });
    return date && isStale(date, today) ? badge("vm-updated vm-date-stale", UPDATED_ICON, inline(shown), `${title}, ${t(lang, "stale", { days: STALE_DAYS })}`) : badge("vm-updated", UPDATED_ICON, inline(shown), title);
  }
  function renderError(errors, lang, block = "steps") {
    return `<div class="vm-error">${escapeHtml(t(lang, "errorAt", { block, ...errors[0] }))}${errors.length > 1 ? ` (+${errors.length - 1})` : ""}</div>`;
  }
  var copyButton = ({ id = null, thread = null, lang, className = "", label }) => `<button type="button" class="vm-copy${className ? ` ${className}` : ""}"${id ? ` data-copy-id="${escapeHtml(id)}"` : ""} data-copied="${escapeHtml(t(lang, "copied"))}" title="${escapeHtml(t(lang, "copy"))}" aria-label="${escapeHtml(label)}"${thread ? ` data-copy-thread="${escapeHtml(thread)}"` : ""}>${COPY_ICON}</button>`;

  // src/share.js
  var SHARE_VALUES = ["intern", "internal"];
  var isInternal = (visual) => SHARE_VALUES.includes(String(visual?.share ?? "").trim().toLowerCase());
  var LOCK_ICON = svg("vm-lock-icon", 12, '<rect x="3.25" y="7" width="9.5" height="6.75" rx="1.5"/><path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2"/>');
  var shareBadge = (lang) => `<span class="vm-band-share">${LOCK_ICON}${escapeHtml(t(lang, "shareInternal"))}</span>`;
  function renderWatermark(visual, lang) {
    const asOf = visual?.["as-of"] ?? visual?.stand;
    const date = parseDate(asOf);
    const note = [t(lang, "watermarkNote"), asOf ? t(lang, "stand", { date: date ? formatDate(date, lang) : asOf }) : ""].filter(Boolean).join(" \xB7 ");
    return `<div class="vm-watermark" aria-hidden="true"><div class="vm-watermark-text"><span class="vm-watermark-word">${escapeHtml(t(lang, "shareInternal"))}</span><span class="vm-watermark-note">${escapeHtml(note)}</span></div></div>`;
  }

  // src/band.js
  function renderBand(visual, today, lang) {
    const asOf = visual?.["as-of"] ?? visual?.stand;
    const created = visual?.created;
    const internal = isInternal(visual);
    if (!asOf && !visual?.status && !created && !internal) return "";
    const asOfDate = parseDate(asOf);
    const createdDate = parseDate(created);
    const stale = Boolean(asOfDate && isStale(asOfDate, today));
    const status = visual.status ? `<span class="vm-band-status">${escapeHtml(visual.status)}</span>` : "";
    const stand = asOf ? `<span>${escapeHtml(t(lang, "stand", { date: asOfDate ? formatDate(asOfDate, lang) : asOf }))}</span>` : "";
    const since = created ? `<span class="vm-band-created">${escapeHtml(t(lang, "created", { date: createdDate ? formatDate(createdDate, lang) : created }))}</span>` : "";
    const warning = stale ? `<span>${escapeHtml(t(lang, "stale", { days: STALE_DAYS }))}</span>` : "";
    const share = internal ? shareBadge(lang) : "";
    const copy = copyButton({ lang, className: "vm-copy-document", label: t(lang, "copyDocument") });
    const watermark = internal ? renderWatermark(visual, lang) : "";
    return `<div class="vm-band${stale ? " vm-stale" : ""}">${status}${share}${stand}${since}${warning}${copy}</div>${watermark}`;
  }

  // src/steps/schema.js
  var STATES = { x: "done", "~": "running", "!": "waiting", " ": "open" };
  var FIELDS = {
    after: "after",
    "waiting-for": "waitingFor",
    owner: "who",
    "done-when": "doneWhen",
    since: "since",
    next: "next",
    thread: "thread",
    updated: "updated"
  };
  var LEGACY_FIELDS = {
    nach: "after",
    "wartet auf": "waitingFor",
    wer: "who",
    "fertig wenn": "doneWhen",
    seit: "since"
  };

  // src/steps/parse.js
  function parseSteps(body, firstLine, lang) {
    const steps = [];
    const errors = [];
    body.split(/\r?\n/).forEach((text, index) => {
      const line = firstLine + index;
      const error = (key, vars) => errors.push({ line, message: t(lang, key, vars) });
      if (!text.trim()) return;
      if (/^\s+- \[/.test(text)) {
        error("errNested");
        return;
      }
      const previous = steps[steps.length - 1];
      if (/^\s/.test(text) && previous) {
        previous.description = previous.description ? `${previous.description} ${text.trim()}` : text.trim();
        return;
      }
      const [head, ...fields] = text.split(" | ");
      const match = /^- \[([x~! ])\] ([a-z0-9][a-z0-9-]*):\s+(.+)$/i.exec(head);
      if (!match || !Object.hasOwn(STATES, match[1])) {
        error("errMalformed");
        return;
      }
      const step = {
        id: match[2],
        state: STATES[match[1]],
        label: match[3].trim(),
        after: [],
        waitingFor: null,
        who: null,
        doneWhen: null,
        since: null,
        next: null,
        description: null,
        thread: null,
        updated: null,
        line
      };
      for (const field of fields) {
        const colon = field.indexOf(":");
        const name = (colon < 0 ? field : field.slice(0, colon)).trim();
        const property = Object.hasOwn(FIELDS, name) ? FIELDS[name] : Object.hasOwn(LEGACY_FIELDS, name) ? LEGACY_FIELDS[name] : null;
        if (colon < 0 || !property) {
          error("errField", { field: name });
          continue;
        }
        const value = field.slice(colon + 1).trim();
        step[property] = property === "after" ? value.split(",").map((id) => id.trim()).filter(Boolean) : value;
      }
      steps.push(step);
    });
    return { steps, errors };
  }

  // src/steps/compute.js
  function validateSteps(steps, lang) {
    const errors = [];
    const byId = /* @__PURE__ */ new Map();
    for (const step of steps) {
      if (byId.has(step.id)) errors.push({ line: step.line, message: t(lang, "errDuplicate", { id: step.id }) });
      else byId.set(step.id, step);
    }
    for (const step of steps) {
      for (const id of step.after) {
        if (!byId.has(id)) errors.push({ line: step.line, message: t(lang, "errUnknown", { id }) });
      }
    }
    const visited = /* @__PURE__ */ new Set();
    const path = [];
    const active = /* @__PURE__ */ new Set();
    function visit(step) {
      if (active.has(step.id)) {
        const cycle = path.slice(path.indexOf(step.id));
        errors.push({ line: byId.get(cycle[0]).line, message: t(lang, "errCycle", { list: cycle.join(", ") }) });
        return;
      }
      if (visited.has(step.id)) return;
      active.add(step.id);
      path.push(step.id);
      for (const id of step.after) if (byId.has(id)) visit(byId.get(id));
      path.pop();
      active.delete(step.id);
      visited.add(step.id);
    }
    for (const step of steps) visit(step);
    return errors;
  }
  function computeSteps(steps) {
    var _a;
    const byId = new Map(steps.map((step) => [step.id, step]));
    const done = steps.filter((step) => step.state === "done").length;
    const now = steps.filter((step) => step.state === "open" && !step.waitingFor && step.after.every((id) => byId.get(id).state === "done")).map((step) => step.id);
    const levels = /* @__PURE__ */ new Map();
    function level(step) {
      if (levels.has(step.id)) return levels.get(step.id);
      const predecessors = step.after.map((id) => byId.get(id)).filter((s) => s.state !== "done");
      const result = predecessors.length ? 1 + Math.max(...predecessors.map(level)) : 0;
      levels.set(step.id, result);
      return result;
    }
    const waves = [];
    for (const step of steps) {
      if (step.state === "done") continue;
      (waves[_a = level(step)] ?? (waves[_a] = [])).push(step.id);
    }
    return { done, total: steps.length, now, waves };
  }

  // src/steps/render.js
  var ICON_SHAPES = {
    ready: '<circle cx="8" cy="8" r="6.25"/><path d="M6.75 5.75v4.5L10.25 8z" fill="currentColor"/>',
    running: '<circle cx="8" cy="8" r="6.25"/><path d="M8 4.25a3.75 3.75 0 0 1 0 7.5z" fill="currentColor" stroke="none"/>',
    later: '<circle cx="8" cy="8" r="6.25" stroke-dasharray="2.5 2.4"/>',
    waiting: '<circle cx="8" cy="8" r="6.25"/><path d="M8 5v3.25l2.1 1.3"/>',
    done: '<circle cx="8" cy="8" r="6.25"/><path d="m5.4 8.15 1.75 1.75 3.45-3.6"/>'
  };
  var icon = (key, className = "vm-group-icon") => svg(`${className} vm-icon-${key}`, 16, ICON_SHAPES[key]);
  var threadLabel = (reference, lang) => /^\[Thread:\s*([^;\]]+)/.exec(reference)?.[1].trim() || t(lang, "thread");
  function renderSteps(steps, computed, lang, { idPrefix = "vm-steps", today = /* @__PURE__ */ new Date(), sections = /* @__PURE__ */ new Set() } = {}) {
    const byId = new Map(steps.map((step) => [step.id, step]));
    const stateOf = (step) => step.state === "open" && step.waitingFor ? "waiting" : step.state;
    const groupOf = (step) => {
      const state = stateOf(step);
      if (state !== "open") return state;
      return computed.now.includes(step.id) ? "ready" : "later";
    };
    const groups = ["ready", "running", "later", "waiting", "done"].map((key) => ({ key, steps: steps.filter((step) => groupOf(step) === key) })).filter((group) => group.steps.length);
    const target = (id) => `${idPrefix}-${id}`;
    const dependency = (id) => `<a href="#${target(id)}" class="vm-dep vm-ref-${groupOf(byId.get(id)) === "ready" ? "can-start" : groupOf(byId.get(id)) === "later" ? "open" : groupOf(byId.get(id))}" title="${escapeHtml(byId.get(id).label)}">${DEPENDENCY_ICON}${escapeHtml(id)}</a>`;
    const field = (kind, label, content) => `<div class="vm-field vm-field-${kind}"><div class="vm-caption">${CAPTION_ICONS[kind]}${escapeHtml(t(lang, label))}</div><div class="vm-field-text">${content}</div></div>`;
    const renderRow = (step) => {
      const group = groupOf(step);
      const state = stateOf(step);
      const pending = step.after.filter((id) => byId.get(id).state !== "done");
      const since = step.since ? inline(t(lang, "since", { when: step.since })) : "";
      const showNeed = state === "waiting" && step.waitingFor;
      const need = showNeed ? `<div class="vm-need">${CAPTION_ICONS.needs}${inline(step.waitingFor)}${since ? `, ${since}` : ""}</div>` : "";
      const summary = step.description ? `<div class="vm-summary">${inline(step.description)}</div>` : "";
      const owner = step.who && (/^agent\b/i.test(step.who) ? badge("vm-owner vm-agent", AGENT_ICON, inline(step.who)) : badge("vm-owner", PERSON_ICON, inline(step.who)));
      const meta = [
        ...pending.map(dependency),
        owner,
        step.thread ? badge("vm-thread", THREAD_ICON, escapeHtml(threadLabel(step.thread, lang)), step.thread) : "",
        step.since && !showNeed ? badge("vm-since", SINCE_ICON, inline(step.since), t(lang, "since", { when: step.since })) : "",
        updatedBadge(step.updated, lang, today)
      ].join("");
      const body = [
        step.description ? field("description", "description", inline(step.description)) : "",
        step.next && (state === "running" || group === "ready") ? field("next", "lineNext", inline(step.next)) : "",
        step.doneWhen && state !== "done" ? field("goal", "goal", inline(step.doneWhen)) : "",
        sections.has(step.id) ? `<a class="vm-section-link" href="#vm-section-${escapeHtml(step.id)}">${SECTION_ICON}${escapeHtml(t(lang, "sectionLink"))}</a>` : ""
      ].join("");
      const copy = copyButton({ id: step.id, thread: step.thread, lang, label: t(lang, "copyStep", { id: step.id }) });
      const head2 = `${icon(group, "vm-status-icon")}<div class="vm-row-main">${idBadge(step.id, lang)}<div class="vm-label">${inline(step.label)}</div>${summary}${need}</div><div class="vm-row-end"><div class="vm-meta">${meta}</div>${copy}`;
      const row = body ? `<details class="vm-row-details"><summary class="vm-row">${head2}<span class="vm-chevron">${CHEVRON_ICON}</span></div></summary><div class="vm-row-body">${body}</div></details>` : `<div class="vm-row">${head2}<span class="vm-chevron"></span></div></div>`;
      return `<li id="${target(step.id)}" class="vm-step vm-${state}${group === "ready" ? " vm-can-start" : ""}">${row}</li>`;
    };
    const rows = groups.map((group) => `<section class="vm-group vm-group-${group.key}"><h3 class="vm-group-title">${icon(group.key)}${escapeHtml(t(lang, `group_${group.key}`))}<span class="vm-group-count">${group.steps.length}</span></h3><ul class="vm-steps-list">${group.steps.map(renderRow).join("")}</ul></section>`).join("");
    const percent = computed.total ? Math.round(100 * computed.done / computed.total) : 0;
    const head = `<div class="vm-steps-head"><span>${escapeHtml(t(lang, "progress", computed))}</span><span class="vm-progress"><span style="width:${percent}%"></span></span></div>`;
    return `<div class="vm-steps">${head}${rows}</div>`;
  }

  // src/chart/schema.js
  var CHART_TYPES = ["bar", "line", "histogram", "share", "heatmap", "waterfall", "pareto", "scatter", "progress", "kpi"];
  var CHART_FIELDS = ["type", "x", "y", "color", "percent", "grouped", "orientation", "target", "label", "note", "says", "basis", "source"];
  var CHART_REQUIRED = ["type", "x", "y", "says", "basis"];
  var CHART_VALUES = { percent: ["yes", "no"], grouped: ["yes", "no"], orientation: ["vertical", "horizontal"] };
  var CHART_NEEDS = { progress: ["target"] };
  var TOTAL_LABEL = /^(gesamt|summe|insgesamt|total|sum)$/i;
  var SHARE_MAX_PARTS = 6;
  var PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
  var RAMP = ["#cde2fb", "#184f95"];
  var NEUTRAL = "#8a8a93";
  var TRACK = "#d6e6fb";

  // src/badges.js
  var BADGE_COLORS = ["ok", "warn", "bad", "info", "muted"];
  var SEPARATOR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
  function parseBadges(value) {
    const map = /* @__PURE__ */ new Map();
    const body = /^\{(.*)\}$/.exec(String(value ?? "").trim())?.[1] ?? "";
    for (const entry of body.split(",")) {
      const [word, color] = entry.split(":").map((part) => part?.trim().replace(/^(["'])(.*)\1$/, "$2"));
      if (word && BADGE_COLORS.includes(color)) map.set(word.toLowerCase(), color);
    }
    return map;
  }
  var isTableSeparator = (line) => line.includes("-") && SEPARATOR.test(line);
  var isTableRow = (line) => line.trim().startsWith("|");
  function renderTableRow(line, badges) {
    return line.replace(/(\|)([^|]*)(?=\|)/g, (match, pipe, cell) => {
      const word = cell.trim();
      const color = badges.get(word.toLowerCase());
      return color ? `${pipe}${cell.replace(word, `<span class="vm-pill vm-pill-${color}">${escapeHtml(word)}</span>`)}` : match;
    });
  }

  // src/chart/table.js
  var cells = (line) => line.trim().replace(/^\|/, "").replace(/(?<!\\)\|\s*$/, "").split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, "|").replace(/^(\*\*|\*|`)(.*)\1$/, "$2").trim());
  function tableAbove(lines, start) {
    let end = start - 1;
    while (end >= 0 && !lines[end].trim()) end--;
    let first = end;
    while (first > 0 && isTableRow(lines[first - 1])) first--;
    if (end < 0 || !isTableRow(lines[end]) || end - first < 2 || !isTableSeparator(lines[first + 1])) return null;
    const header = cells(lines[first]);
    const rows = lines.slice(first + 2, end + 1).map((line, index) => ({ line: first + 3 + index, values: cells(line) }));
    return { header, rows };
  }
  function parseNumber(raw, lang) {
    let text = String(raw ?? "").replace(/[\s %€$]|EUR|USD/gi, "");
    if (!text || /^[-–—]$/.test(text)) return null;
    const german = /^[+-]?\d{1,3}(\.\d{3})+(,\d+)?$/;
    const english = /^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/;
    if (lang === "en") {
      if (english.test(text)) text = text.replace(/,/g, "");
    } else if (german.test(text)) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else if (/^[+-]?\d+,\d+$/.test(text)) {
      text = text.replace(",", ".");
    }
    return /^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(text) ? Number(text) : NaN;
  }

  // src/chart/format.js
  var SEPARATORS = { de: { decimal: ",", thousands: "." }, en: { decimal: ".", thousands: "," } };
  function formatNumber(value, lang, decimals = 2) {
    const { decimal, thousands } = SEPARATORS[lang] ?? SEPARATORS.de;
    const fixed = Math.abs(value).toFixed(decimals).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
    const [whole, fraction] = fixed.split(".");
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
    return `${value < 0 ? "\u2212" : ""}${grouped}${fraction ? decimal + fraction : ""}`;
  }
  var formatPercent = (share, lang, decimals = 1) => `${formatNumber(share * 100, lang, decimals)}${lang === "en" ? "%" : " %"}`;
  var formatSigned = (value, lang) => `${value > 0 ? "+" : ""}${formatNumber(value, lang)}`;

  // src/chart/specs.js
  var FONT = 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  var WIDTH = 640;
  var MUTED = "#6b6b74";
  var INK = "#52514e";
  var DARK_INK = "#0b0b0b";
  var ISO_DATE = /^\d{4}-\d{2}(-\d{2})?$/;
  var LOCALES = {
    de: { decimal: ",", thousands: ".", grouping: [3], currency: ["", " \u20AC"], percent: " %" },
    en: { decimal: ".", thousands: ",", grouping: [3], currency: ["$", ""] }
  };
  var unique = (values) => [...new Set(values)];
  var inkOn = (color) => color === PALETTE[3] ? DARK_INK : "#ffffff";
  function base(fields, values, lang) {
    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: fields.says,
      background: "transparent",
      data: { values },
      config: {
        font: FONT,
        locale: { number: LOCALES[lang] },
        view: { stroke: null },
        range: { category: PALETTE },
        axis: {
          labelFontSize: 12,
          titleFontSize: 12,
          titleFontWeight: 500,
          titlePadding: 10,
          labelColor: MUTED,
          titleColor: MUTED,
          gridColor: "#ededf0",
          domain: false,
          ticks: false,
          labelPadding: 6,
          labelLimit: 320
        },
        axisX: { grid: false },
        legend: { orient: "top", labelLimit: 280, labelFontSize: 12, titleFontSize: 12, titleFontWeight: 500, labelColor: MUTED, titleColor: MUTED, symbolType: "circle", symbolSize: 90 },
        mark: { color: PALETTE[0] },
        text: { fontSize: 12, color: INK }
      }
    };
  }
  var seriesOrder = (rows) => unique(rows.map((row) => row.series));
  var colorBy = (data, rows) => ({ field: "series", type: "nominal", title: data.seriesTitle, sort: seriesOrder(rows) });
  function barSpec(fields, data, lang) {
    const series = data.rows.some((row) => row.series !== null);
    const values = data.rows.map((row) => ({ x: row.x, y: row.y, ...series ? { series: row.series } : {} }));
    const percent = fields.percent === "yes";
    const grouped = series && fields.grouped === "yes";
    const order = unique(values.map((row) => row.x));
    const horizontal = fields.type === "bar" && (fields.orientation ? fields.orientation === "horizontal" : order.some((x) => String(x).length > 12) || order.length > 8);
    const histogram = fields.type === "histogram";
    const category = {
      field: "x",
      type: "ordinal",
      sort: order,
      title: horizontal ? null : data.xTitle,
      scale: { paddingInner: histogram ? 0.04 : grouped ? 0.2 : 0.25, paddingOuter: histogram ? 0 : 0.15 },
      ...horizontal ? {} : { axis: { labelAngle: 0 } }
    };
    const measure = {
      field: "y",
      type: "quantitative",
      title: percent ? null : data.yTitle,
      ...series && !grouped ? { stack: percent ? "normalize" : "zero" } : {},
      ...percent ? { axis: { format: "%" } } : {}
    };
    const offset = grouped ? { [horizontal ? "yOffset" : "xOffset"]: { field: "series", sort: seriesOrder(data.rows), scale: { paddingInner: 0.08 } } } : {};
    const encoding = {
      [horizontal ? "y" : "x"]: category,
      [horizontal ? "x" : "y"]: measure,
      ...series ? { color: colorBy(data, data.rows) } : {},
      ...offset
    };
    const size = horizontal ? { width: WIDTH - 140, height: { step: grouped ? 18 * seriesOrder(data.rows).length + 10 : 28 } } : { width: WIDTH, height: 260 };
    const bar = { type: "bar", ...series && !grouped ? { cornerRadius: 2, stroke: "#ffffff", strokeWidth: 1.5 } : { cornerRadiusEnd: 4 } };
    if (series) return { ...base(fields, values, lang), ...size, mark: bar, encoding };
    const label = {
      mark: { type: "text", ...horizontal ? { align: "left", dx: 6 } : { baseline: "bottom", dy: -4 } },
      encoding: { x: encoding.x, y: encoding.y, text: { field: "y", type: "quantitative", format: ",~r" } }
    };
    return { ...base(fields, values, lang), ...size, layer: [{ mark: bar, encoding }, ...order.length <= 16 ? [label] : []] };
  }
  function lineSpec(fields, data, lang) {
    const series = data.rows.some((row) => row.series !== null);
    const xs = data.rows.map((row) => row.x);
    const temporal = xs.every((value) => ISO_DATE.test(value));
    const numeric = !temporal && xs.every((value) => Number.isFinite(parseNumber(value, lang)));
    const values = data.rows.map((row) => ({ x: numeric ? parseNumber(row.x, lang) : row.x, y: row.y, ...series ? { series: row.series } : {} }));
    const x = { field: "x", type: temporal ? "temporal" : numeric ? "quantitative" : "ordinal", title: data.xTitle, axis: { labelAngle: 0 }, ...temporal || numeric ? {} : { sort: unique(xs) } };
    return {
      ...base(fields, values, lang),
      width: WIDTH,
      height: 260,
      mark: { type: "line", strokeWidth: 2, point: { filled: true, size: 50 } },
      encoding: { x, y: { field: "y", type: "quantitative", title: data.yTitle }, ...series ? { color: colorBy(data, data.rows) } : {} }
    };
  }
  function shareSpec(fields, data, lang) {
    let parts = data.rows.map((row) => ({ x: row.x, y: row.y }));
    if (parts.length > SHARE_MAX_PARTS) {
      const kept = [...parts].sort((a, b) => b.y - a.y).slice(0, SHARE_MAX_PARTS - 1);
      const rest = parts.filter((part) => !kept.includes(part)).reduce((sum, part) => sum + part.y, 0);
      parts = [...parts.filter((part) => kept.includes(part)), { x: t(lang, "chartOther"), y: rest }];
    }
    const total = parts.reduce((sum, part) => sum + part.y, 0) || 1;
    let start = 0;
    const values = parts.map((part, index) => {
      const share = part.y / total;
      const value = { x: part.x, start, end: start + share, label: share >= 0.07 ? formatPercent(share, lang, share < 0.1 ? 1 : 0) : "", ink: inkOn(PALETTE[index % PALETTE.length]) };
      start += share;
      return value;
    });
    if (values.length) values[values.length - 1].end = 1;
    const order = values.map((value) => value.x);
    const scaleX = { domain: [0, 1] };
    return {
      ...base(fields, values, lang),
      width: WIDTH,
      height: 28,
      encoding: { y: { value: 14 } },
      layer: [
        {
          mark: { type: "bar", height: 28, cornerRadius: 4, stroke: "#ffffff", strokeWidth: 2 },
          encoding: {
            x: { field: "start", type: "quantitative", scale: scaleX, axis: null },
            x2: { field: "end" },
            color: { field: "x", type: "nominal", sort: order, title: null }
          }
        },
        {
          mark: { type: "text", align: "left", dx: 8, fontWeight: 600 },
          encoding: { x: { field: "start", type: "quantitative", scale: scaleX, axis: null }, text: { field: "label" }, color: { field: "ink", type: "nominal", scale: null } }
        }
      ]
    };
  }
  function heatmapSpec(fields, data, lang) {
    const values = data.rows.map((row) => ({ x: row.x, series: row.series, y: row.y, label: formatNumber(row.y, lang) }));
    const max = Math.max(...values.map((value) => value.y), 0);
    const columns = seriesOrder(data.rows);
    return {
      ...base(fields, values, lang),
      width: Math.min(WIDTH - 160, columns.length * 120),
      height: { step: 36 },
      encoding: {
        x: { field: "series", type: "ordinal", sort: columns, title: null, axis: { orient: "top", labelAngle: 0 } },
        y: { field: "x", type: "ordinal", sort: unique(data.rows.map((row) => row.x)), title: null }
      },
      layer: [
        {
          mark: { type: "rect", cornerRadius: 4, stroke: "#ffffff", strokeWidth: 2 },
          encoding: { color: { field: "y", type: "quantitative", scale: { range: RAMP, domain: [0, max || 1] }, legend: null } }
        },
        {
          mark: { type: "text", fontWeight: 500 },
          encoding: {
            text: { field: "label" },
            color: { condition: { test: `datum.y > ${max * 0.55}`, value: "#ffffff" }, value: DARK_INK }
          }
        }
      ]
    };
  }
  function waterfallSpec(fields, data, lang) {
    let running = 0;
    const values = data.rows.map((row, index) => {
      if (index === 0 || row.total || row.y === null) {
        if (index === 0) running = row.y ?? 0;
        return { x: row.x, start: 0, end: running, kind: "total", label: formatNumber(running, lang) };
      }
      const start = running;
      running += row.y;
      return { x: row.x, start, end: running, kind: row.y >= 0 ? "up" : "down", label: formatSigned(row.y, lang) };
    });
    const order = values.map((value) => value.x);
    const x = { field: "x", type: "ordinal", sort: order, title: null, axis: { labelAngle: order.some((name) => name.length > 14) ? -30 : 0 }, scale: { paddingInner: 0.3 } };
    const kinds = [t(lang, "chartTotal"), t(lang, "chartUp"), t(lang, "chartDown")];
    const named = values.map((value) => ({ ...value, kind: kinds[["total", "up", "down"].indexOf(value.kind)] }));
    return {
      ...base(fields, named, lang),
      width: WIDTH,
      height: 260,
      encoding: { x },
      layer: [
        {
          mark: { type: "bar", cornerRadius: 3 },
          encoding: {
            y: { field: "start", type: "quantitative", title: data.yTitle },
            y2: { field: "end" },
            color: { field: "kind", type: "nominal", scale: { domain: kinds, range: [NEUTRAL, PALETTE[0], PALETTE[7]] }, title: null }
          }
        },
        {
          mark: { type: "text", baseline: "bottom", dy: -4 },
          encoding: { y: { field: "top", type: "quantitative" }, text: { field: "label" } },
          transform: [{ calculate: "max(datum.start, datum.end)", as: "top" }]
        }
      ]
    };
  }
  function paretoSpec(fields, data, lang) {
    const sorted = [...data.rows].sort((a, b) => b.y - a.y);
    const total = sorted.reduce((sum, row) => sum + row.y, 0) || 1;
    let cumulative = 0;
    const values = sorted.map((row) => {
      cumulative += row.y;
      return { x: row.x, share: row.y / total, cumulative: cumulative / total, label: formatPercent(row.y / total, lang, 0) };
    });
    const names = [t(lang, "chartShare"), t(lang, "chartCumulative")];
    const x = { field: "x", type: "ordinal", sort: values.map((value) => value.x), title: data.xTitle, axis: { labelAngle: values.some((v) => v.x.length > 10) ? -30 : 0 }, scale: { paddingInner: 0.25 } };
    const y = (field) => ({ field, type: "quantitative", title: null, scale: { domain: [0, 1] }, axis: { format: "%" } });
    return {
      ...base(fields, values, lang),
      width: WIDTH,
      height: 260,
      encoding: { x },
      layer: [
        { mark: { type: "bar", cornerRadiusEnd: 4 }, encoding: { y: y("share"), color: { datum: names[0], scale: { domain: names, range: [PALETTE[0], PALETTE[1]] }, title: null } } },
        ...values.length <= 12 ? [{ mark: { type: "text", baseline: "bottom", dy: -4 }, encoding: { y: y("share"), text: { field: "label" } } }] : [],
        { mark: { type: "line", strokeWidth: 2, point: { filled: true, size: 50 } }, encoding: { y: y("cumulative"), color: { datum: names[1] } } },
        { data: { values: [{}] }, mark: { type: "rule", strokeDash: [4, 4], color: MUTED }, encoding: { x: { value: 0 }, x2: { value: "width" }, y: y("mark"), text: null }, transform: [{ calculate: "0.8", as: "mark" }] }
      ]
    };
  }
  function scatterSpec(fields, data, lang) {
    const series = data.rows.some((row) => row.series !== null);
    const values = data.rows.map((row) => ({ x: row.xNumber, y: row.y, ...series ? { series: row.series } : {}, ...row.label ? { label: row.label } : {} }));
    const encoding = {
      x: { field: "x", type: "quantitative", title: data.xTitle, scale: { zero: false, nice: true }, axis: { grid: true } },
      y: { field: "y", type: "quantitative", title: data.yTitle, scale: { zero: false, nice: true } }
    };
    const labels2 = values.some((value) => value.label) && values.length <= 20;
    return {
      ...base(fields, values, lang),
      width: WIDTH,
      height: 300,
      encoding,
      layer: [
        { mark: { type: "point", filled: true, size: 70, opacity: 1, stroke: "#ffffff", strokeWidth: 1.5 }, encoding: series ? { color: colorBy(data, data.rows) } : {} },
        ...labels2 ? [{ mark: { type: "text", align: "left", dx: 8 }, encoding: { text: { field: "label" } } }] : []
      ]
    };
  }
  function progressSpec(fields, data, lang) {
    const values = data.rows.map((row) => {
      const share = row.target ? row.y / row.target : 0;
      return { x: row.x, share: Math.min(share, 1), label: `${formatPercent(share, lang, 0)} \xB7 ${formatNumber(row.y, lang)} / ${formatNumber(row.target, lang)}` };
    });
    const y = { field: "x", type: "ordinal", sort: values.map((value) => value.x), title: null };
    const x = (field) => ({ field, type: "quantitative", scale: { domain: [0, 1] }, axis: null });
    return {
      ...base(fields, values, lang),
      width: WIDTH - 320,
      height: { step: 30 },
      encoding: { y },
      layer: [
        { mark: { type: "bar", height: 10, cornerRadius: 5, color: TRACK }, encoding: { x: { datum: 1, type: "quantitative", scale: { domain: [0, 1] }, axis: null } } },
        { mark: { type: "bar", height: 10, cornerRadius: 5, color: PALETTE[0] }, encoding: { x: x("share") } },
        { mark: { type: "text", align: "left", dx: 10 }, encoding: { x: { datum: 1, type: "quantitative", scale: { domain: [0, 1] }, axis: null }, text: { field: "label" } } }
      ]
    };
  }
  var BUILDERS = {
    bar: barSpec,
    histogram: barSpec,
    line: lineSpec,
    share: shareSpec,
    heatmap: heatmapSpec,
    waterfall: waterfallSpec,
    pareto: paretoSpec,
    scatter: scatterSpec,
    progress: progressSpec
  };
  var chartSpec = (fields, data, lang) => BUILDERS[fields.type](fields, data, lang);

  // src/chart/render.js
  function parseChart(body, firstLine, lang) {
    const fields = {};
    const errors = [];
    body.split(/\r?\n/).forEach((text, index) => {
      if (!text.trim()) return;
      const line = firstLine + index;
      const match = /^([a-z-]+):\s*(.*?)\s*$/i.exec(text);
      if (!match || !CHART_FIELDS.includes(match[1])) {
        errors.push({ line, message: t(lang, "errField", { field: match?.[1] ?? text.trim() }) });
        return;
      }
      fields[match[1]] = match[2];
    });
    for (const field of CHART_REQUIRED) {
      if (!fields[field]) errors.push({ line: firstLine, message: t(lang, "errRequired", { field }) });
    }
    if (fields.type && !CHART_TYPES.includes(fields.type)) {
      errors.push({ line: firstLine, message: t(lang, "errValue", { field: "type", value: fields.type, list: CHART_TYPES.join(", ") }) });
    }
    for (const field of CHART_NEEDS[fields.type] ?? []) {
      if (!fields[field]) errors.push({ line: firstLine, message: t(lang, "errRequired", { field }) });
    }
    for (const [field, allowed] of Object.entries(CHART_VALUES)) {
      if (fields[field] && !allowed.includes(fields[field])) {
        errors.push({ line: firstLine, message: t(lang, "errValue", { field, value: fields[field], list: allowed.join(", ") }) });
      }
    }
    return { fields, errors };
  }
  function chartData(fields, table, firstLine, lang) {
    if (!table) return { errors: [{ line: firstLine - 1, message: t(lang, "errNoTable") }] };
    const errors = [];
    const column = (name) => {
      const index = table.header.findIndex((head) => head.toLowerCase() === name.toLowerCase());
      if (index < 0) errors.push({ line: firstLine, message: t(lang, "errColumn", { column: name }) });
      return index;
    };
    const optional = (name) => fields[name] ? column(fields[name]) : -1;
    const yNames = fields.y.split(",").map((name) => name.trim()).filter(Boolean);
    const x = column(fields.x);
    const ys = yNames.map(column);
    const color = optional("color");
    const target = optional("target");
    const label = optional("label");
    const note = optional("note");
    if (fields.color && yNames.length > 1) errors.push({ line: firstLine, message: t(lang, "errColorMulti") });
    if (errors.length) return { errors };
    const number = (row, index) => {
      const value = parseNumber(row.values[index], lang);
      if (Number.isNaN(value)) errors.push({ line: row.line, message: t(lang, "errNumber", { value: row.values[index], column: table.header[index] }) });
      return Number.isNaN(value) ? null : value;
    };
    const rows = [];
    for (const row of table.rows) {
      const xValue = row.values[x] ?? "";
      const total = TOTAL_LABEL.test(xValue);
      if (total && fields.type !== "waterfall" && fields.type !== "kpi") continue;
      for (const index of ys) {
        const series = color >= 0 ? row.values[color] ?? "" : yNames.length > 1 ? table.header[index] : null;
        if (fields.type === "kpi") {
          rows.push({ x: xValue, y: row.values[index] ?? "", note: note >= 0 ? row.values[note] ?? "" : null });
          continue;
        }
        const value = number(row, index);
        if (value === null && !(fields.type === "waterfall" && total)) continue;
        const record = { x: xValue, y: value, series, total };
        if (target >= 0) record.target = number(row, target);
        if (label >= 0) record.label = row.values[label] ?? "";
        if (fields.type === "scatter") record.xNumber = number(row, x);
        rows.push(record);
      }
    }
    const seriesCount = new Set(rows.map((row) => row.series)).size;
    if (fields.type === "scatter" && seriesCount > 3) errors.push({ line: firstLine, message: t(lang, "errSeries", { max: 3 }) });
    return {
      errors,
      rows,
      xTitle: table.header[x],
      yTitle: yNames.length > 1 ? null : table.header[ys[0]],
      seriesTitle: color >= 0 ? table.header[color] : null
    };
  }
  function renderKpis(rows) {
    return `<div class="vm-kpis">${rows.map((row) => `<div class="vm-kpi"><div class="vm-kpi-label">${inline(row.x)}</div><div class="vm-kpi-value">${inline(row.y)}</div>${row.note ? `<div class="vm-kpi-note">${inline(row.note)}</div>` : ""}</div>`).join("")}</div>`;
  }
  function renderChart(fields, data, lang) {
    const foot = [
      `<div class="vm-chart-foot"><div class="vm-chart-basis">${escapeHtml(t(lang, "chartBasis"))}: ${inline(fields.basis)}</div>`,
      fields.source ? `<div class="vm-chart-source">${escapeHtml(t(lang, "chartSource"))}: ${inline(fields.source)}</div>` : "",
      "</div></div>"
    ].join("");
    const head = `<div class="vm-chart vm-chart-${fields.type}"><div class="vm-chart-says">${inline(fields.says)}</div>`;
    if (fields.type === "kpi") return [`${head}${renderKpis(data.rows)}${foot}`, ""];
    return [head, "", "```vega-lite", JSON.stringify(chartSpec(fields, data, lang)), "```", "", foot, ""];
  }
  function transformChart(lines, start, end, lang) {
    const { fields, errors } = parseChart(lines.slice(start + 1, end).join("\n"), start + 2, lang);
    if (errors.length) return { errors };
    const data = chartData(fields, tableAbove(lines, start), start + 2, lang);
    if (data.errors.length) return { errors: data.errors };
    return { output: renderChart(fields, data, lang) };
  }

  // src/sections.js
  var HEADING = /^(#{2,6})\s+(.*?)\s+\{#([a-z0-9][a-z0-9-]*)((?:\s+[a-z][a-z-]*=[^\s}]+)*)\s*\}\s*$/i;
  function renderSection(line, lang, today) {
    const match = HEADING.exec(line);
    if (!match) return null;
    const [, hashes, title, id, rest] = match;
    const attributes = Object.fromEntries([...rest.matchAll(/([a-z][a-z-]*)=([^\s}]+)/gi)].map(([, key, value]) => [key, value]));
    const meta = `<div class="vm-section-meta" id="vm-section-${escapeHtml(id)}">${idBadge(id, lang)}${updatedBadge(attributes.updated, lang, today)}${copyButton({ id, lang, className: "vm-copy-section", label: t(lang, "copyStep", { id }) })}</div>`;
    return [`${hashes} ${title}`, meta, ""];
  }
  function sectionIds(lines) {
    const ids = /* @__PURE__ */ new Set();
    let fence = null;
    for (const line of lines) {
      const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (marker) {
        if (!fence) fence = marker[1];
        else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !line.slice(marker.index + marker[1].length).trim()) fence = null;
        continue;
      }
      const match = !fence && HEADING.exec(line);
      if (match) ids.add(match[3]);
    }
    return ids;
  }

  // src/cards.js
  var CARD_START = /^>\s?\[!card((?:\s+[a-z-]+)*)\s*\]\s*(.*)$/i;
  var COLORS = {
    green: "green",
    yellow: "yellow",
    red: "red",
    indigo: "indigo",
    grey: "grey",
    gray: "grey",
    ok: "green",
    warn: "yellow",
    bad: "red",
    info: "indigo",
    muted: "grey"
  };
  var ICON_SHAPES2 = {
    flag: '<path d="M3.75 14V2.5M3.75 3h8.5l-2 3 2 3h-8.5"/>',
    question: '<circle cx="8" cy="8" r="6.25"/><path d="M6.25 6.25a1.85 1.85 0 0 1 3.6.6c0 1.25-1.85 1.6-1.85 2.65M8 11.4v.1"/>',
    check: '<circle cx="8" cy="8" r="6.25"/><path d="m5.4 8.15 1.75 1.75 3.45-3.6"/>',
    warning: '<path d="M8 2.5 14 13H2z"/><path d="M8 6.5v3M8 11.25v.1"/>',
    bulb: '<path d="M6 12.5h4M6.5 14.25h3M5.25 10c-1-.85-1.75-2-1.75-3.5a4.5 4.5 0 0 1 9 0c0 1.5-.75 2.65-1.75 3.5"/>',
    info: '<circle cx="8" cy="8" r="6.25"/><path d="M8 7.25v3.75M8 5v.1"/>',
    pin: '<path d="M8 14.25s4.5-4.1 4.5-7.75a4.5 4.5 0 0 0-9 0c0 3.65 4.5 7.75 4.5 7.75z"/><circle cx="8" cy="6.5" r="1.5"/>',
    clock: '<circle cx="8" cy="8" r="6.25"/><path d="M8 5v3.25l2.1 1.3"/>',
    note: '<path d="M4 2.25h5.5L12.75 5.5v8.25H4z"/><path d="M6.25 8.5h4M6.25 11h4"/>'
  };
  var CARD_COLORS = Object.keys(COLORS);
  var CARD_ICONS = Object.keys(ICON_SHAPES2);
  function renderCard(lines, start) {
    const match = CARD_START.exec(lines[start]);
    if (!match) return null;
    const tokens = match[1].trim().toLowerCase().split(/\s+/).filter(Boolean);
    const color = COLORS[tokens.find((token) => COLORS[token])] ?? "grey";
    const iconName = tokens.find((token) => ICON_SHAPES2[token]);
    let end = start;
    const body = [];
    while (end + 1 < lines.length && /^>/.test(lines[end + 1])) body.push(lines[++end].replace(/^>\s?/, ""));
    while (body.length && !body[body.length - 1].trim()) body.pop();
    const icon2 = iconName ? `<span class="vm-card-icon">${svg(`vm-card-svg vm-card-svg-${iconName}`, 16, ICON_SHAPES2[iconName])}</span>` : "";
    const head = `<div class="vm-card vm-card-${color}"><div class="vm-card-head">${icon2}<span class="vm-card-title">${inline(match[2].trim())}</span></div>`;
    const output = body.length ? [`${head}<div class="vm-card-body">`, "", ...body, "", "</div></div>", ""] : [`${head}</div>`, ""];
    if (end + 1 < lines.length && !lines[end + 1].trim()) end++;
    return { output, end };
  }

  // src/core.js
  function transform(markdown, { today = /* @__PURE__ */ new Date() } = {}) {
    const { visual, endLine } = readVisual(markdown);
    const lang = visual?.lang === "en" ? "en" : "de";
    const band = renderBand(visual, today, lang);
    const lines = markdown.split(/\r?\n/);
    const firstContent = lines.findIndex((line, i) => i > endLine && line.trim());
    const bandAfter = firstContent >= 0 && /^# /.test(lines[firstContent]) ? firstContent : endLine;
    const sections = sectionIds(lines);
    const output = [];
    let changed = Boolean(band);
    let fence = null;
    let section = null;
    let card = null;
    const badges = parseBadges(visual?.badges);
    let tableBody = false;
    const insertBand = () => output.push("", band, "");
    if (band && bandAfter === -1) insertBand();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i <= endLine) {
        output.push(line);
      } else if (fence) {
        output.push(line);
        const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(line);
        if (close && close[1][0] === fence.char && close[1].length >= fence.length) fence = null;
      } else {
        const open = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
        const kind = open && !line.startsWith(" ") ? open[2].trim() : null;
        if (kind === "steps" || kind === "chart") {
          let end = i + 1;
          while (end < lines.length) {
            const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(lines[end]);
            if (close && close[1][0] === open[1][0] && close[1].length >= open[1].length) break;
            end++;
          }
          if (kind === "chart") {
            const chart = transformChart(lines, i, end, lang);
            output.push(...chart.errors ? ["", renderError(chart.errors, lang, "chart"), ""] : ["", ...chart.output]);
            changed = true;
            i = end;
            continue;
          }
          let html;
          try {
            const { steps, errors } = parseSteps(lines.slice(i + 1, end).join("\n"), i + 2, lang);
            errors.push(...validateSteps(steps, lang));
            html = errors.length ? renderError(errors, lang) : renderSteps(steps, computeSteps(steps), lang, { idPrefix: `vm-steps-${i + 1}`, today, sections });
          } catch (error) {
            html = renderError([{ line: i + 2, message: String(error.message ?? error) }], lang);
          }
          output.push("", html, "");
          changed = true;
          i = end;
        } else if (badges.size && tableBody && isTableRow(line)) {
          output.push(renderTableRow(line, badges));
          changed = true;
        } else if (badges.size && isTableSeparator(line) && isTableRow(lines[i - 1] ?? "")) {
          output.push(line);
          tableBody = true;
        } else if (!open && (card = renderCard(lines, i))) {
          output.push(...card.output);
          changed = true;
          i = card.end;
        } else if (!open && (section = renderSection(line, lang, today))) {
          output.push(...section);
          changed = true;
        } else {
          output.push(line);
          if (open) fence = { char: open[1][0], length: open[1].length };
        }
      }
      if (!isTableRow(line)) tableBody = false;
      if (band && i === bandAfter) insertBand();
    }
    return changed ? output.join("\n") : markdown;
  }

  // src/parser-entry.js
  var parser_entry_default = {
    onWillParseMarkdown: async (markdown) => transform(markdown, { today: /* @__PURE__ */ new Date() }),
    onDidParseMarkdown: async (html) => html
  };
  return __toCommonJS(parser_entry_exports);
})();

return __visualMarkdown.default;
})()
