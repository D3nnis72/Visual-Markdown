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
      errorAt: "Fehler in steps, Zeile {line}: {message}",
      errMalformed: "kein Schritt im Format \u201E- [ ] k\xFCrzel: Text\u201C",
      errField: "unbekanntes Feld \u201E{field}\u201C",
      errNested: "Unterpunkte kommen erst sp\xE4ter",
      errDuplicate: "K\xFCrzel \u201E{id}\u201C doppelt",
      errUnknown: "\u201E{id}\u201C in after gibt es nicht",
      errCycle: "Zyklus \xFCber {list}"
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
      errorAt: "Error in steps, line {line}: {message}",
      errMalformed: 'not a step in the form "- [ ] id: text"',
      errField: 'unknown field "{field}"',
      errNested: "sub-items are not supported yet",
      errDuplicate: 'duplicate id "{id}"',
      errUnknown: '"{id}" in after does not exist',
      errCycle: "cycle through {list}"
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
  var copyButton = ({ id = null, thread = null, lang, className = "", label }) => `<button type="button" class="vm-copy${className ? ` ${className}` : ""}"${id ? ` data-copy-id="${escapeHtml(id)}"` : ""} data-copied="${escapeHtml(t(lang, "copied"))}" title="${escapeHtml(t(lang, "copy"))}" aria-label="${escapeHtml(label)}"${thread ? ` data-copy-thread="${escapeHtml(thread)}"` : ""}>${COPY_ICON}</button>`;

  // src/band.js
  function renderBand(visual, today, lang) {
    const asOf = visual?.["as-of"] ?? visual?.stand;
    const created = visual?.created;
    if (!asOf && !visual?.status && !created) return "";
    const asOfDate = parseDate(asOf);
    const createdDate = parseDate(created);
    const stale = Boolean(asOfDate && isStale(asOfDate, today));
    const status = visual.status ? `<span class="vm-band-status">${escapeHtml(visual.status)}</span>` : "";
    const stand = asOf ? `<span>${escapeHtml(t(lang, "stand", { date: asOfDate ? formatDate(asOfDate, lang) : asOf }))}</span>` : "";
    const since = created ? `<span class="vm-band-created">${escapeHtml(t(lang, "created", { date: createdDate ? formatDate(createdDate, lang) : created }))}</span>` : "";
    const warning = stale ? `<span>${escapeHtml(t(lang, "stale", { days: STALE_DAYS }))}</span>` : "";
    const copy = copyButton({ lang, className: "vm-copy-document", label: t(lang, "copyDocument") });
    return `<div class="vm-band${stale ? " vm-stale" : ""}">${status}${stand}${since}${warning}${copy}</div>`;
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
  function renderError(errors, lang) {
    return `<div class="vm-error">${escapeHtml(t(lang, "errorAt", errors[0]))}${errors.length > 1 ? ` (+${errors.length - 1})` : ""}</div>`;
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
        if (open && !line.startsWith(" ") && open[2].trim() === "steps") {
          let end = i + 1;
          while (end < lines.length) {
            const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(lines[end]);
            if (close && close[1][0] === open[1][0] && close[1].length >= open[1].length) break;
            end++;
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
