---
name: mermaid-theme
description: Use whenever you write or edit a Mermaid diagram (flowchart, sequence, state) in Markdown, canvases, READMEs or docs that Dennis previews with the MPE Notion theme. The theme already defines all node colors as classes, so diagrams only assign a class and never define colors.
---

# Mermaid Theme

The MPE Notion theme (`style.less` in this repo) colors Mermaid nodes by CSS class, separately for light and dark, and forces node and text colors with `!important`. A `classDef`, `style` or `color:` in the diagram is therefore either redundant or fights the theme. **Diagrams assign classes. They never define colors.**

## Rules

1. Give every node one class from the table. Use `:::name` on the node or `class A,B,C name` at the end.
2. Do not write `classDef`, `style`, `linkStyle`, hex colors or `%%{init}%%`.
3. Pick the class by what the node is, not by what looks nice. A new meaning means a new class in `style.less` first, then a row here.
4. Do not write a legend for the node kinds (`code`, `llm`, `human`, `gate`, `store`): the renderer adds it under the diagram. Only `ok`, `warn`, `bad` and `accent` need a one-line legend in words, because their meaning changes per diagram.
5. Long labels: quote them and break with `<br/>` at about 40 characters. Titles with description: `["<b>Title</b><br/>Description"]`.
6. Decisions are hexagons `{{"..."}}`, not diamonds. The theme does not round diamonds.
7. When nodes need more than their name, such as an explanation, a state badge or what each exit of a decision means, use a `flow` block from the visual-markdown skill instead of long labels or a numbered list under the diagram. Keep labels short there.

## Classes

| Class | Meaning | Use for |
|---|---|---|
| `code` | Deterministic code | parsers, joins, rules, checks |
| `llm` | Model step | LLM calls, judging, extraction |
| `human` | Human step | review, approval, decision by a person |
| `gate` | Decision | branching questions |
| `store` | Persistent artifact | rule book, tables, files, databases |
| `accent` | Highlight | one node the reader must not miss |
| `ok` / `warn` / `bad` | Status | green, yellow, red outcomes |
| `dot` | Start or end | `S(( )):::dot` |

Subgraphs are styled by the theme as neutral layers. Use them to group steps, not to color them.

## Example

```mermaid
flowchart TD
    A["Export lines"]:::code --> B{{"Class certain?"}}:::gate
    B -- yes --> C["Extract features"]:::llm
    B -- no --> D["Review"]:::human
    C --> E[("Rule book")]:::store
    D --> E
```

## Outside the theme

On GitHub or in Notion the classes have no styling and nodes render in the default colors. That is accepted. Do not add `classDef` fallbacks to the diagram.
