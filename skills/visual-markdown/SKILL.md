---
name: visual-markdown
description: Use when writing, converting or updating a document people look at in Markdown Preview Enhanced, such as a canvas, project status page, decision or question list or report, and when a Markdown file has a `visual:` front matter key, a `steps`, `chart`, `scale`, `gallery`, `compare` or `glossary` code block, headings like `## Title {#id updated=…}` or `> [!card …]` callouts.
---

# Visual Markdown

Visual Markdown is plain `.md` that the MPE parser and theme from this repo render as status band, work list, cards and charts. The file holds content and state; the renderer adds all visuals. **The [README](../../README.md) owns the format**, every field of every block. Read the parts you need before writing. [examples/bausteine.md](../../examples/bausteine.md) shows every block once.

These paths are relative to the repo root. The skill directory is usually a symlink, so find the root with `git -C <this skill's directory> rev-parse --show-toplevel` instead of resolving `../..` by hand.

Not for knowledge docs that mainly agents read: those stay plain Markdown.

## Pick the block by the content

| Content | Block |
| --- | --- |
| Status, as-of date, creation date | `visual:` front matter, shown as the band. The status stands only there: no `**Status:**` line in the text, also not from a `brainstorming` canvas header |
| Work with owners, states and dependencies | `steps` |
| A list by urgency, such as problems ranked P1 to P3 | `steps`: location and concrete problem in the title, `priority:`, current behaviour, impact and desired result in the description, and a detail link in `see:`. Follow the entry recipe below. Reproduction and investigation stay on the detail page |
| Decision, question, risk, idea | `> [!card icon color] Title`, with the ID first when it has one (`E51: …`, `Frage 6: …`), so the ID links to the card everywhere else in the file. Only the file that owns the ID makes the card, other files link to it |
| Abbreviations and domain terms a reader may not know | `glossary` block, one `Term: explanation` per line |
| Numbers worth seeing | Table, then `chart` directly below it. Pick the `type` by what the reader must do with the numbers (README, Diagramme) and put the link to the analysis in `source` |
| A few headline numbers | Table, then `chart` with `type: kpi` |
| Thresholds and ranges, such as health states or tolerances | `scale` |
| Screenshots side by side, before and after, light and dark | `gallery` |
| Two to four approaches with pros and cons | `compare`, at most one `| empfohlen` |
| States in table cells | `badges:` in the front matter |
| A topic someone will point at | `## Title {#id updated=YYYY-MM-DD}` |
| Page with customer data (path under `Customers/`) | `share: intern` in the front matter |

Everything else stays normal Markdown, flows stay Mermaid (skill `mermaid-theme`).

`steps` shows the project's work across everyone involved. One person's own to-dos stay in their task tool, such as Notion, and are not copied into `steps`.

## Write overviews, tasks and priorities so each entry stands alone

The opening paragraph names the overall goal, the current obstacle and what remains to be done. Each entry then answers where the issue occurs, what happens there and how it should work, without requiring the reader to open a detail page.

Use this recipe for problem and review lists:

1. **Title: `<Agent or product> → <page or section>: <concrete problem>`.** Use the actual names from the interface. For tasks, put the concrete outcome after the colon. If a screenshot does not identify the page, say that its exact location is not yet confirmed and use only the known area.
2. **Description: problem, consequence and desired result.** Explain what happens and why it matters in two or three short sentences. This is the expanded “Description”, separate from the current work state.
3. **Current status:** put the latest established working state in `status:`, separate from the problem description and `next:`. This stays visible even when collapsed. Name what has been investigated, assigned, implemented, released and tested as applicable, what remains and which facts are unknown. Include the evidence date and environment for a reported release or test; a reported “live” fix without an environment does not establish production. If a ticket or concrete result exists, link it directly in `status` and update this field with `updated` whenever work progresses. A created ticket alone does not mean implementation has started. Every running step needs a concrete status naming what is done and what keeps it running; for other steps without it, the renderer shows the computed state.
4. **Action and evidence:** put a distinct next action in `next:`, known responsibility in `owner:`, and details or evidence in `see:`. These supplement the problem and desired result. An agreement about who may work on it is not the problem description.

```steps
- [ ] coverage: Procurement Agent → RFQ → Supplier overview: Offer totals omit item coverage | priority: P1 | status: Issue documented; implementation and retest pending | see: [Details](details.md#coverage) | updated: 2026-11-06
  A partial offer can appear cheaper because its total does not show how many requested items were priced. Show priced versus requested items beside the total, with declined and unanswered items distinguishable. Retest coverage against the submitted lines.
```

Split a collection of issues when they occur on different pages or can be completed independently. Preserve existing step IDs and links when rewriting. Keep one entry for each problem, with confirmed improvements and the remaining scope together. A repaired example, changed template or reported fix does not establish that the whole flow works.

In a priority overview, explain what makes a problem urgent and order entries by priority, with related problems together within each group. If urgency is not established, leave it unclassified. Before finishing, compare the overview with the newest evidence and detail pages, replacing stale claims while preserving their factual test dates. Check every entry for current work state, location, problem, consequence, desired result and remaining work. Read the entry with its visible `status`: it must answer “where does this stand now?” without opening a linked page or interpreting an icon. Updating the summary from existing evidence does not make an old observation a new live test.

## Dates mean "content last changed or confirmed"

`updated` on a step or section and `as-of` in the front matter are the dates the content was last changed or confirmed true. They are what a reader trusts.

- Changing a step or section: set its `updated` and the document's `as-of` to today.
- Converting a page into the format without new facts: keep the source's date ("Stand: 30.10." becomes `2026-10-30`) for `as-of`, every `updated` and done steps. A format change is not new information.
- A section or step you did not touch keeps its date, even when you edit the file.
- `created` is the date the document was first written. If the source does not say, use the oldest date you know and say so in your reply.

## Editing an existing page

1. `grep -n '^##' file.md` lists every section with id and date. Write into the section that owns the topic. A new section only for a topic none covers.
2. The page's main question or goal stays at the top, in the title, the status band and the first section. A sub-question the user raises, even one they stress ("check first whether X is good enough"), gets its own section or card under it and does not take over the lead. Only the user changes the main question; when their message sounds like they did, ask in one line. A canvas from `brainstorming` names it in its `Main question` line.
3. Move steps through their states instead of rewriting them: `[ ]` → `[~]` → `[x]`, `[!]` with `waiting-for` and `since` while blocked, removed again when unblocked.
4. Mark a step done only when its `done-when` is reported as met. If the news is vaguer, keep it running and write what was reported into the description.

## Do not invent

`thread` only with a real `[Thread: Title; ref=…]` mention. `basis` of a chart names the real source. Decision and question numbers come from the source. When something is unknown, leave the field out and name the gap in your reply.

## Check before you finish

```bash
node "$(git -C <this skill's directory> rev-parse --show-toplevel)/scripts/check.mjs" --strict path/to/file.md
```

Errors are blocks that render as an error box. Warnings are a `**Status:**` line that repeats the band, missing dates, missing descriptions on open steps, missing concrete status on running steps, a chart without `source`, an `as-of` older than the newest `updated`, or a customer page without `share: intern`. Fix all of them, or say in your reply why one stays.
