# How a design differs from the others

Six designs share one set of markup, one content model and one set of routes:
the three candidates, each with an identity of its own, and the three
token-only designs the demo started from, kept so the switcher can show the
before as well as the after. A starting point is a `ThemeSpec` and nothing
else — it has no stylesheet in `src/styles/themes/` and is not getting one,
because being only tokens is the whole of what it has to demonstrate.

The switcher swaps `data-theme` on `<html>` and nothing else — no reload, no
second page, no second copy of the content. Everything a design can change, it
changes from inside that constraint.

This is the map of what those levers are, in the order you would reach for them.

---

## 1. Tokens — `src/lib/themes.ts`

Each design is a `ThemeSpec`: two or three faces, a Utopia type scale, a space
scale, a colour set, and five shape values. `src/components/Tokens.astro` turns
every design into one stylesheet of custom properties, each block scoped to
`:root[data-theme="<id>"]`. A starting point stops here; a candidate carries on
through the four levers below.

Nothing that belongs here belongs in a stylesheet. If you find yourself writing
a literal `2px` or `#f0f0f0` in `src/styles/themes/`, the value wants to be a
token — that is what happened to the rule weights, which lived as nineteen
copies of `2px` and `3px` before becoming `ruleStrong` and `ruleHeavy`.

| Token group | Emitted as | Notes |
| --- | --- | --- |
| `fonts` | `--font-display`, `--font-body`, `--font-mono` | `mono` is optional; a design that says nothing keeps the system stack |
| `type` | `--step--1` … `--step-5` | Fluid, interpolating over 320–1240px |
| `space` | `--space-3xs` … `--space-3xl` | Multiples of one fluid base step |
| `colors` | `--color-<name>` | Light only. `data-theme` names a design, not a colour mode |
| `shape` | `--radius`, `--rule`, `--rule-strong`, `--rule-heavy`, `--measure` | Three rule weights: divide a row, open a section, close a masthead |

A design that draws structure some other way still declares all three rule
weights — Instrument sets every one of them to the same hairline, which states
its position rather than leaving it to be inferred from an absence.

## 2. Arrangement — the shared grid

`base.css` declares one grid, `.page`, with four named areas: `nav`,
`identity`, `main` and an optional `rail`. Each candidate rearranges those areas
from its own file and none of them moves the markup; the starting points take
the default arrangement, which is what the candidates all looked like before
their identity runs.

```
Record (≥62rem)              Feature (any width)   Instrument (≥48rem)

┌────────┬──────┬──────┐     ┌───────────────┐    ┌──────┬────────────┐
│identity│ main │ rail │     │   identity    │    │    identity       │
├────────┤      │      │     ├───────────────┤    ├──────┼────────────┤
│  nav   │      │      │     │      nav      │    │ nav  │    main    │
└────────┴──────┴──────┘     ├───────────────┤    └──────┴────────────┘
                             │     main      │
14rem / 1fr / 13rem          └───────────────┘    11rem / 1fr
                             (rail hidden)        (rail hidden)
```

- **Record** is a three-column module: a 14rem identity-and-menu column, the
  content, and a 13rem column for an in-page index. The column positions do not
  move between pages — a page with no index widens into the third column rather
  than shifting the first two. Opens at 62rem.
- **Feature** stacks the masthead over a horizontal menu and gives `main` its
  own four-line grid: an indent, a 40rem text column, and a margin wide enough
  for a figure or an annotation to break into. Opens at 62rem.
- **Instrument** puts a full-width identity panel across the top and an 11rem
  menu rail down the left, on every page including the home page. Opens at
  48rem — earlier than the other two, deliberately, so a tablet still shows
  three shapes rather than two.

The `rail` slot is the one piece of page structure a page cannot write from
inside `<main>`, because it is a sibling of it in that grid. Two of the three
designs hide it and repeat their railless arrangement for the pages that fill
it, so hiding it opens no empty row.

## 3. Layers — `src/styles/themes/*.css`

`base.css` declares the layer order once:

```css
@layer reset, base, layout, components, utilities;
```

Every theme file extends those same layers, scoped to `:root[data-theme='x']`.
No design gets a stylesheet of its own to compete with the base one, and no
rule anywhere depends on source order.

Three files, one shape each:

| File | Design | What it mostly does |
| --- | --- | --- |
| `a.css` | Record | Draws the grid: gutter rules, section rules, a year rail |
| `b.css` | Feature | Spends the margin track: figures, annotations, datelines |
| `c.css` | Instrument | Labels everything: monospaced identifiers, three rule colours |

## 4. Markup that only one design has — `Themed.astro`

Where a design needs an element the others do not — Feature's cover question,
Record's funder strip, Instrument's software listing and source line — it comes
from `<Themed themes="b">`. The wrapper ships every variant into every page and
each design's stylesheet reveals the ones that are its own, because the switcher
swaps an attribute at runtime and a variant cannot be chosen at build time.
`display: none` takes the rest out of the accessibility tree as well as off the
screen, so a screen reader hears one version, not three.

Hidden by default, revealed by name — not the other way round. A design with no
stylesheet of its own would otherwise show every variant at once, which is
exactly what the three starting points are, and failing closed turns a
forgotten reveal into a missing block rather than three stacked ones.

The wrapper is `display: contents`, so it never takes a grid track. That has one
consequence worth knowing: a section a design supplies for itself sits in the
same place on the page as a shared one but **not** in the same place in a
selector. A rule written for `main > section` will miss it. Both paths have to
be spelled out — `b.css` and `c.css` each do this.

Three rules for using it:

1. **Never wrap navigation, the identity block or `<main>`.** Those are
   landmarks, and a second copy is a bug even while it is hidden.
   `test/single-emission.test.ts` enforces one of each per page.
2. **It is for variants of a thing, not for bulk.** Three copies of the
   publication list is three copies in the HTML.
3. **Where CSS over one piece of markup can do it, do it in CSS.**

## 5. Naming — how one component means three things

Most of the separation is not new markup at all. It is one element, named
precisely enough that three designs can each have an opinion about it. A
starting point has an opinion about none of them, and takes the shared
treatment in every row below.

| Class | What it names | Record | Feature | Instrument |
| --- | --- | --- | --- | --- |
| `.pub__year` | A paper's year, out of the citation | Railed down a 4rem margin | Hidden; stays in the citation | Hidden |
| `.pubs--dated` | A list of dated entries, not citations | No year rail | Date set right, as a dateline | — |
| `.pub__doi` | The identifier a paper is addressed by | Hidden | Hidden | Right-aligned, monospaced |
| `.dateline` | The date on a single dated page | Tracked label over a rule | Display italic | Monospace, tabular |
| `.person__placeholder` | This person is not real | Tracked capitals | Editor's italic | Monospaced label |
| `.card__title` | A card's title, at any heading level | Shared | Serif, or sans when a repo name | Body size |
| `.lede` | A page's opening line | Shared muted step-1 | Display serif | Body colour, body size |
| `.identity__key` | The field an identity line came from | Hidden | Hidden | Shown, monospaced |
| `.source-line`, `.build-line` | Where the page comes from | Hidden | Hidden | Shown |

The pattern is the same every time: emit the fact once, in real text, and let
each design decide whether it is a rail, a label or nothing. A design that hides
it is making a statement about what it thinks a lab site is for. Reaching the
same element positionally instead — `p:first-of-type`, `p:last-of-type` — is how
this goes wrong, and it broke the moment a third paragraph appeared.

## Invariants

Anything here that a change would break is pinned by a test or a checker.

- **One `<nav>`, one identity block, one `<main>`, one `<h1>` per page**, in
  all six designs — `test/single-emission.test.ts` and `pnpm check:responsive`.
- **The measure constrains prose, not the column.** `--measure` applies to
  paragraphs and headings, never to a grid container: applying it to the
  container squeezes the team grid, the gallery and the card lists.
- **Every page works at 320px first.** `pnpm check:responsive` drives a real
  browser over every page, viewport and design: touch targets ≥44px, body text
  ≥16px on mobile, nothing under 12px, no sideways scroll.
- **Light only.** `data-theme` is spent naming the design, so there is no dark
  palette and no `light-dark()` outside `src/admin/`, which is a tool surface
  rather than a candidate design.
- **No parallel stylesheet, no colour literals, no hardcoded type or space.**

## Related

- `docs/theme-identity-brief.md` — why the three designs differ, and the
  six-axis matrix that keeps them from converging.
- `docs/theme-identity-review.md` — the design review those axes were tested
  against, and what it found.
