---
name: visual-markdown
description: Use when writing, converting or updating a document people look at in Markdown Preview Enhanced, such as a canvas, project status page, decision or question list or report, and when a Markdown file has a `visual:` front matter key, a `steps`, `chart`, `scale`, `gallery`, `compare`, `glossary`, `message` or `flow` code block, headings like `## Title {#id updated=…}` or `> [!card …]` callouts.
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
| A plan worked through in order, such as "first the finding, then the import, then the run" | `steps` with `after` on every step that has to wait. The renderer then lists numbered stages instead of state groups, steps in one stage can run in parallel, and the reader ticks the plan off top to bottom. So set `after` wherever the order matters, also when it seems obvious. Each step is one concrete result that can be finished. A step that needs its own sub-steps gets its own canvas, linked in `see:`; there are no sub-items |
| A method or fixed order of checks that is repeated per case, such as "per supplier, check A, then B, then C" | Numbered table, with a `badges:` column for how far each method step is (idea, done by hand, built). Not `steps`: a method step is never done once, so progress, owner and Todo would be noise. The concrete work behind it (apply it to the next cases, build the tool, send the answer) goes into a separate `steps` block with owners |
| A list by urgency, such as problems ranked P1 to P3 | `steps`: location and concrete problem in the title, `priority:`, current behaviour, impact and desired result in the description, and a detail link in `see:`. Follow the entry recipe below. Reproduction and investigation stay on the detail page |
| Decision, question, risk, idea | `> [!card icon color] Title`, with the ID first when it has one (`E51: …`, `Frage 6: …`), so the ID links to the card everywhere else in the file. Only the file that owns the ID makes the card, other files link to it |
| Abbreviations and domain terms a reader may not know | `glossary` block, one `Term: explanation` per line |
| Numbers worth seeing | Table, then `chart` directly below it. Pick the `type` by what the reader must do with the numbers (README, Diagramme) and put the link to the analysis in `source` |
| A few headline numbers | Table, then `chart` with `type: kpi` |
| Thresholds and ranges, such as health states or tolerances | `scale` |
| Screenshots side by side, before and after, light and dark | `gallery` |
| A process where nodes need more than their name: explanation, state badge, what each exit of a decision means | `flow`: Mermaid flowchart with short node names, `---`, then `node: explanation \| badge` per node. The renderer numbers the nodes, adds the legend and lists the exits from the edge labels. A diagram whose nodes are clear from their names stays `mermaid` |
| A ready-to-copy message or agent prompt, with its own ticket and record links | `message`: optional `to: recipient`, separator `---`, then the exact Markdown body. Keep notes and conditions outside. The preview offers rich-text and Markdown copy |
| Supplementary context the reader may open when needed | `toggle`: required `title:`, optional `open: true`, separator `---`, then Markdown content. Closed by default. For code fences inside, use a longer outer fence. Keep the current status and next action outside |
| Two to four approaches with pros and cons | `compare`, at most one `| empfohlen` |
| States in table cells | `badges:` in the front matter |
| A topic someone will point at | `## Title {#id updated=YYYY-MM-DD}` |
| Page with customer data (path under `Customers/`) | `share: intern` in the front matter |

Everything else stays normal Markdown, plain diagrams stay Mermaid (skill `mermaid-theme`). The renderer adds the legend of node kinds under every Mermaid diagram, so do not write one.

`steps` shows the project's work across everyone involved. One person's own to-dos stay in their task tool, such as Notion, and are not copied into `steps`.

## Write overviews, tasks and priorities so each entry stands alone

The opening paragraph names the overall goal, the current obstacle and what remains to be done. Each entry then answers where the issue occurs, what happens there and how it should work, without requiring the reader to open a detail page.

Use this recipe for problem and review lists:

1. **Title: `<Agent or product> → <page or section>: <concrete problem>`.** This arrow form is for problem and review lists only; ordinary tasks name their outcome. Use the actual names from the interface. For tasks, put the concrete outcome after the colon. If a screenshot does not identify the page, say that its exact location is not yet confirmed and use only the known area.
2. **Description: problem, consequence and desired result.** Explain what happens and why it matters in two or three short sentences. This is the expanded “Description”, separate from the current work state.
3. **Current status:** put the latest established working state in `status:`, separate from the problem description and `next:`. This stays visible even when collapsed. Name what has been investigated, assigned, implemented, released and tested as applicable, what remains and which facts are unknown. Include the evidence date and environment for a reported release or test; a reported “live” fix without an environment does not establish production. If a ticket or concrete result exists, link it directly in `status` and update this field with `updated` whenever work progresses. A created ticket alone does not mean implementation has started. Every running step needs a concrete status naming what is done and what keeps it running; for other steps without it, the renderer shows the computed state.
4. **Action and evidence:** put a distinct next action in `next:`, the next responsible person in `owner:`, their relation to the reader in `responsibility:`, progress in `workflow:`, and a linked ticket with its checked `ticket-status` and `ticket-owner`, and details or evidence in `see:`. These supplement the problem and desired result. An agreement about who may work on it is not the problem description.

```steps
- [ ] coverage: Procurement Agent → RFQ → Supplier overview: Offer totals omit item coverage | priority: P1 | status: Issue documented; implementation and retest pending | see: [Details](details.md#coverage) | updated: 2026-11-06
  A partial offer can appear cheaper because its total does not show how many requested items were priced. Show priced versus requested items beside the total, with declined and unanswered items distinguishable. Retest coverage against the submitted lines.
```

Split a collection of issues when they occur on different pages or can be completed independently. Preserve existing step IDs and links when rewriting. Keep one entry for each problem, with confirmed improvements and the remaining scope together. A repaired example, changed template or reported fix does not establish that the whole flow works.

In a priority overview, explain what makes a problem urgent and order entries by priority, with related problems together within each group. If urgency is not established, leave it unclassified. Before finishing, compare the overview with the newest evidence and detail pages, replacing stale claims while preserving their factual test dates. Check every entry for current work state, location, problem, consequence, desired result and remaining work. Read the entry with its visible `status`: it must answer “where does this stand now?” without opening a linked page or interpreting an icon. Updating the summary from existing evidence does not make an old observation a new live test.

## Ownership, progress and linked tickets

The README's steps schema owns allowed workflows and matching checkbox states. The icon shape shows progress, its colour shows responsibility relative to the reader: self, delegated or neutral. Keep the visible person and status labels; colour is not the only signal. Old entries remain neutral until ownership is established. Do not infer this relation from an arbitrary person's name or from the existence of a ticket.

When creating a ticket or updating an overview, read every relevant linked Linear issue's current status and assignee through the connector. Store the direct `ticket` link, exact `ticket-status`, and `ticket-owner`; update `status` and `updated` from that evidence. The actual responsible person determines delegation, not whether a ticket exists. A ticket assigned to the reader stays self-owned. Preserve names such as In Review, On Hold, Done (Eng), Staging and Production; the general Linear type alone cannot distinguish all progress states. Choose the local workflow for the remaining work and match its checkbox using the README.

If a completed fix still needs a local retest, keep the step open with the retest owner and their responsibility, while retaining the completed ticket's original status and assignee. A ticket's completion is not proof that `done-when` is met. Canceled and duplicate work does not satisfy successful prerequisites. Without a ticket, update from the observed work and confirmed assignments.

Synchronise during authorised overview maintenance or an explicit refresh. For automatic ticket facts, a step may explicitly opt in with `ticket-sync: true` beside its Linear `ticket` link. An installed local service discovers opted-in steps under configured project roots; no individual file registration is needed. A plain ticket link or `ticket-sync: false` does not opt in. See the README and `docs/linear-sync.md` for installation. Do not silently add sync markers or install a background service merely while formatting an overview. A renderer load never calls Linear.

The service changes only `ticket-status`, `ticket-owner` and the calendar date `ticket-checked`. An unassigned ticket removes an old `ticket-owner`. Local `workflow`, checkbox, `owner`, `responsibility`, `status`, `next`, `updated` and `visual.as-of` stay unchanged, so a pending retest remains open. `ticket-checked` is source metadata only and is not displayed as a local update date. It advances on a successful check even when the facts stayed the same; subsequent unchanged checks that day do not rewrite the file. If access fails, retain the last verified facts and check date. During agent maintenance, also name the access gap in `status`. Never invent a new state.

## Dates mean "content last changed or confirmed"

`updated` on a step or section and `as-of` in the front matter are the dates the content was last changed or confirmed true. They are what a reader trusts.

- Changing a step or section: set its `updated` and the document's `as-of` to today.
- Exception: the automatic service only changes ticket facts and `ticket-checked`; this does not confirm the local work or advance local dates.
- Converting a page into the format without new facts: keep the source's date ("Stand: 30.10." becomes `2026-10-30`) for `as-of`, every `updated` and done steps. A format change is not new information.
- A section or step you did not touch keeps its date, even when you edit the file.
- `created` is the date the document was first written. If the source does not say, use the oldest date you know and say so in your reply.

## Editing an existing page

1. `grep -n '^##' file.md` lists every section with id and date. Write into the section that owns the topic. A new section only for a topic none covers.
2. The page's main question or goal stays at the top, in the title, the status band and the first section. A sub-question the user raises, even one they stress ("check first whether X is good enough"), gets its own section or card under it and does not take over the lead. Only the user changes the main question; when their message sounds like they did, ask in one line. A canvas from `brainstorming` names it in its `Main question` line.
3. Move steps through their states instead of rewriting them: `[ ]` → `[~]` → `[x]`, `[!]` with `waiting-for` and `since` while blocked, removed again when unblocked.
4. Mark a step done only when its `done-when` is reported as met. If the news is vaguer, preserve the last evidenced workflow and write what was reported into `status`.

## Do not invent

`thread` only with a real `[Thread: Title; ref=…]` mention. `basis` of a chart names the real source. Decision and question numbers come from the source. When something is unknown, leave the field out and name the gap in your reply.

## Check before you finish

```bash
node "$(git -C <this skill's directory> rev-parse --show-toplevel)/scripts/check.mjs" --strict path/to/file.md
```

Errors are blocks that render as an error box. Warnings are a `**Status:**` line that repeats the band, missing dates, missing descriptions on open steps, missing concrete status on running steps, a chart without `source`, an `as-of` older than the newest `updated`, or a customer page without `share: intern`. Fix all of them, or say in your reply why one stays.
