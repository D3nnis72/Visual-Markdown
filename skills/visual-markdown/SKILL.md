---
name: visual-markdown
description: Use when writing, converting or updating a document people look at in Markdown Preview Enhanced, such as a canvas, project status page, decision or question list or report, and when a Markdown file has a `visual:` front matter key, a `steps`, `chart`, `scale`, `gallery`, `compare` or `glossary` code block, headings like `## Title {#id updated=…}` or `> [!card …]` callouts.
---

# Visual Markdown

Visual Markdown is plain `.md` that the MPE parser and theme from this repo render as status band, work list, cards and charts. The file holds content and state; the renderer adds all visuals. **The [README](../../README.md) owns the format**, every field of every block. Read the parts you need before writing. [examples/bausteine.md](../../examples/bausteine.md) shows every block once.

Not for knowledge docs that mainly agents read: those stay plain Markdown.

## Pick the block by the content

| Content | Block |
| --- | --- |
| Status, as-of date, creation date | `visual:` front matter, shown as the band |
| Work with owners, states and dependencies | `steps` |
| Decision, question, risk, idea | `> [!card icon color] Title`, with the ID first when it has one (`E51: …`, `Frage 6: …`), so the ID links to the card everywhere else in the file |
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

## Dates mean "content last changed or confirmed"

`updated` on a step or section and `as-of` in the front matter are the dates the content was last changed or confirmed true. They are what a reader trusts.

- Changing a step or section: set its `updated` and the document's `as-of` to today.
- Converting a page into the format without new facts: keep the source's date ("Stand: 30.10." becomes `2026-10-30`) for `as-of`, every `updated` and done steps. A format change is not new information.
- A section or step you did not touch keeps its date, even when you edit the file.
- `created` is the date the document was first written. If the source does not say, use the oldest date you know and say so in your reply.

## Editing an existing page

1. `grep -n '^##' file.md` lists every section with id and date. Write into the section that owns the topic. A new section only for a topic none covers.
2. Move steps through their states instead of rewriting them: `[ ]` → `[~]` → `[x]`, `[!]` with `waiting-for` and `since` while blocked, removed again when unblocked.
3. Mark a step done only when its `done-when` is reported as met. If the news is vaguer, keep it running and write what was reported into the description.

## Do not invent

`thread` only with a real `[Thread: Title; ref=…]` mention. `basis` of a chart names the real source. Decision and question numbers come from the source. When something is unknown, leave the field out and name the gap in your reply.

## Check before you finish

```bash
node <this skill's directory>/../../scripts/check.mjs --strict path/to/file.md
```

Errors are blocks that render as an error box. Warnings are missing dates, missing descriptions on open steps, a chart without `source`, an `as-of` older than the newest `updated`, or a customer page without `share: intern`. Fix all of them, or say in your reply why one stays.
