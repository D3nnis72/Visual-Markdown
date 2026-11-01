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
      errUnknown: "\u201E{id}\u201C in nach gibt es nicht",
      errCycle: "Zyklus \xFCber {list}"
    },
    en: {
      progress: "{done} of {total} done",
      done: "done",
      running: "running",
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
      errUnknown: '"{id}" in nach does not exist',
      errCycle: "cycle through {list}"
    }
  };
  function t(lang, key, vars = {}) {
    return (labels[lang]?.[key] ?? labels.de[key] ?? key).replace(/\{(\w+)\}/g, (match, name) => String(vars[name] ?? match));
  }

  // src/band.js
  var STALE_DAYS = 7;
  var months = {
    de: ["Januar", "Februar", "M\xE4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };
  function renderBand(visual, today, lang) {
    if (!visual?.stand && !visual?.status) return "";
    const language = lang === "en" ? "en" : "de";
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(visual.stand ?? "");
    let date = visual.stand;
    let stale = false;
    if (match) {
      const [, year, month, day] = match.map(Number);
      const timestamp = Date.UTC(year, month - 1, day);
      const parsed = new Date(timestamp);
      if (parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day) {
        date = `${day}${language === "de" ? "." : ""} ${months[language][month - 1]} ${year}`;
        stale = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - timestamp > STALE_DAYS * 864e5;
      }
    }
    const status = visual.status ? `<span class="vm-band-status">${escapeHtml(visual.status)}</span>` : "";
    const stand = visual.stand ? `<span>${escapeHtml(t(lang, "stand", { date }))}</span>` : "";
    const warning = stale ? `<span>${escapeHtml(t(lang, "stale", { days: STALE_DAYS }))}</span>` : "";
    return `<div class="vm-band${stale ? " vm-stale" : ""}">${status}${stand}${warning}</div>`;
  }

  // src/steps/schema.js
  var STATES = { x: "done", "~": "running", "!": "waiting", " ": "open" };
  var FIELDS = { nach: "after", "wartet auf": "waitingFor", wer: "who", "fertig wenn": "doneWhen", seit: "since" };

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
        line
      };
      for (const field of fields) {
        const colon = field.indexOf(":");
        const name = (colon < 0 ? field : field.slice(0, colon)).trim();
        if (colon < 0 || !Object.hasOwn(FIELDS, name)) {
          error("errField", { field: name });
          continue;
        }
        const value = field.slice(colon + 1).trim();
        step[FIELDS[name]] = name === "nach" ? value.split(",").map((id) => id.trim()).filter(Boolean) : value;
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
  function renderSteps(steps, computed, lang) {
    const byId = new Map(steps.map((step) => [step.id, step]));
    const labels2 = (ids) => ids.map((id) => byId.get(id).label).join(", ");
    const icons = { done: "\u25CF", running: "\u25D0", waiting: "\u23F8", open: "\u25CB" };
    const rows = steps.map((step) => {
      const canStart = computed.now.includes(step.id);
      let note;
      if (step.state === "done" || step.state === "running") note = t(lang, step.state);
      else if (step.waitingFor) note = t(lang, "waitingFor", { what: step.waitingFor });
      else if (step.state === "waiting") note = t(lang, "waiting");
      else if (canStart) note = t(lang, "canStart");
      else note = t(lang, "after", { list: labels2(step.after.filter((id) => byId.get(id).state !== "done")) });
      if (step.since) note += ` (${t(lang, "since", { when: step.since })})`;
      const title = step.doneWhen ? ` title="${escapeHtml(step.doneWhen)}"` : "";
      return `<li class="vm-step vm-${step.state}${canStart ? " vm-can-start" : ""}"${title}><span class="vm-icon">${icons[step.state]}</span><span class="vm-label">${inline(step.label)}</span><span class="vm-who">${inline(step.who ?? "")}</span><span class="vm-note">${inline(note)}</span></li>`;
    }).join("");
    const percent = computed.total ? Math.round(100 * computed.done / computed.total) : 0;
    const head = `<div class="vm-steps-head"><span>${escapeHtml(t(lang, "progress", computed))}</span><span class="vm-progress"><span style="width:${percent}%"></span></span></div>`;
    const now = `<div class="vm-now">${escapeHtml(t(lang, "now"))}: ${inline(computed.now.length ? labels2(computed.now) : t(lang, "nothingNow"))}</div>`;
    const waves = computed.waves.length < 2 ? "" : `<div class="vm-waves">${escapeHtml(t(lang, "waves"))}: ${computed.waves.map((wave, i) => `${i + 1}: ${inline(labels2(wave))}`).join(" \xB7 ")}</div>`;
    return `<div class="vm-steps">${head}<ul class="vm-steps-list">${rows}</ul>${now}${waves}</div>`;
  }
  function renderError(errors, lang) {
    return `<div class="vm-error">${escapeHtml(t(lang, "errorAt", errors[0]))}${errors.length > 1 ? ` (+${errors.length - 1})` : ""}</div>`;
  }

  // src/core.js
  function transform(markdown, { today = /* @__PURE__ */ new Date() } = {}) {
    const { visual, endLine } = readVisual(markdown);
    const lang = visual?.lang === "en" ? "en" : "de";
    const band = renderBand(visual, today, lang);
    const lines = markdown.split(/\r?\n/);
    const firstContent = lines.findIndex((line, i) => i > endLine && line.trim());
    const bandAfter = firstContent >= 0 && /^# /.test(lines[firstContent]) ? firstContent : endLine;
    const output = [];
    let changed = Boolean(band);
    let fence = null;
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
            html = errors.length ? renderError(errors, lang) : renderSteps(steps, computeSteps(steps), lang);
          } catch (error) {
            html = renderError([{ line: i + 2, message: String(error.message ?? error) }], lang);
          }
          output.push("", html, "");
          changed = true;
          i = end;
        } else {
          output.push(line);
          if (open) fence = { char: open[1][0], length: open[1].length };
        }
      }
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
