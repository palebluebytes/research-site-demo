# Design review — step 6 gate

Run against `docs/theme-identity-brief.md` at `0cda6ba`, on the built site
(`pnpm build` + `pnpm preview`), driving chromium through `playwright-core` the
way `scripts/check-responsive.mjs` does. Screenshots are in `.scratch/design-review/`
(gitignored): 13 pages × 3 designs × 3 viewports, above-the-fold and full-page,
with the demo banner and the switcher hidden so neither is reviewed as design.

Dark mode is not reviewed: the site is light-only and `data-theme` names which
design is showing.

Every finding below has been acted on except one, which is named as left open
and why. **What was done** at the foot of the page lists the commits.

---

## The question

> Placed side by side, do these read as three designs or as one design with a
> tint control?

**Three designs.** Not narrowly, either — the separation survives being blurred
to thumbnails (`squint.png`, six pages × three designs at 300px wide with a
1.6px blur, which is the closest thing to seeing them the way she will).

What carries it, measured at 1280px:

| | A — Record | B — Feature | C — Instrument |
|---|---|---|---|
| Ground | `#fafafa` neutral | `#faf6f1` warm | `#f6f7f9` cool |
| Page-title size | 56.8px | 77.3px | 35.1px |
| Home `h1` size | 75.8px | 27.0px | 20.8px |
| Nav | vertical rail, 224px, caps, Archivo 13.5px | horizontal band, 1158px, sentence case | vertical rail, 176px, Source Code Pro 14.7px |
| `main` starts at x | 306 | 61 | 280 |
| Team page height | 2098px | 4744px | 2337px |

A 2.2× spread in page-title size is not a tint control. The publications
dialects are the strongest evidence of all: A sets a year rail, B sets a serif
title with a lavender annotation block beside it, C sets compact rows with the
DOI right-aligned in mono and `PREPRINT` tags (`sbs-pubs-mid.png`). Three
different answers to the same data.

**The qualification, which was the review's real finding.** The separation was
not evenly distributed. It was strongest on `/` and `/publications/`, strong on
`/team/`, `/software/` and `/projects/`, and thinned out badly on `/news/`,
`/events/` and every detail page — where all three rendered the same `.pub` list
or the same title-plus-paragraph, and only type and accent hue told them apart.
A visitor landing on a news item saw one design with a tint control. Sophie,
comparing from the home page, saw three.

Those pages now carry the separation too: a dateline in the margin against a
railed year against a monospaced identifier, and a `.lede` and a `.dateline`
that each design has its own view of. What follows is the review as it was
written, with what was done about each finding.

**On Record vs Instrument specifically** — the distance the brief's 2026-09-09
amendment flagged as possibly too small. It was carried almost entirely by type
and density, and two of the twelve findings were about widening it again:

- The layout-grammar difference was real at ≥62rem (A's rail) / ≥58rem (C's)
  and **gone at 768px**, where both collapsed to identity → wrapping nav →
  prose. Below 928px the axis that was supposed to separate them stopped
  separating them. Instrument's rail now opens at 48rem, so a tablet shows
  three shapes rather than two.
- On the home page, C was A minus the funder strip, plus mono labels, a
  portrait and a source line — the thinnest page on the site, showing neither
  software nor data, on the direction whose whole argument is that software and
  data have parity with publications. It now closes on the three repositories.

---

## Must fix

**1. Record: news and events carried a phantom year rail.** ✅ `69d6499`
`src/styles/themes/a.css` gridded every `.pub` at `4rem minmax(0, 1fr)` and
pushed everything that is not `.pub__year` into column 2. `/news/` and
`/events/` reuse `.pub` and have no year, so every item on both pages sat behind
a 4rem empty track for no reason — a drawn gutter with nothing on either side of
it, in the design whose motif is that the grid is visible. `.pubs--dated` now
marks the two lists whose rows are dated entries rather than citations, and the
rail is scoped to the lists that are not. Scoped by list rather than by
`:has(.pub__year)` so a paper missing a year still lines up with its neighbours.

## Should fix

**2. Record: the team page was ragged.** ✅ `ae8398c`
`.people__grid` used `repeat(auto-fill, …)`, and most ranks in this lab hold one
person, so four of six sections showed a rule that stopped dead at 50% width
with nothing under the other half while the section rule above ran full width.
`auto-fit` in Record only — Feature sets portraits in that grid and a lone
contributor stretched to full width would be a plate, not a portrait.

**3. Feature: the magazine grammar only reached three pages.** ✅ `d418dc5`
`/`, `/projects/` and `/software/` genuinely used the varied column widths.
`/research/`, `/news/`, `/events/` and `/team/` were one column at x=157 with
the right ~420px empty. Research is all prose and a feature's text column is
exactly that, so it keeps the margin empty on purpose; news and events now put
the date out into it as a dateline, in the display italic — the same device the
selected publications use for their annotations, and deliberately the opposite
decision to Record's, which sets the year first in a margin the text is
indented past.

**4. Feature: vertical rhythm read as unfinished rather than generous.** ✅ `c5ea430`
`/team/` was 5284px against Record's 2098 and Instrument's 2337 for identical
content. `<main>` is a grid in Feature, so a grid item's top margin does not
collapse with its first child's: every section paid its own space and then its
heading's, 165px before the first rank and 120px before each one after, against
Record's 33 and Instrument's 16. The section keeps the space; the heading that
opens it gives its own back. 4744px now, and the page is portraits rather than
gaps.

**5. Feature: the figure plate's side column collapsed at tablet.** ✅ `53f5dcc`
At 768px the note beside Fig. 1 fell to roughly 120px — four or five words a
line. It holds a demo note today, but it is the slot the figure's own commentary
sits in, and the motif is figures that carry their citation. The split moved to
62rem, the same line the content grid's margin track opens on, so the asymmetry
arrives with the space that pays for it.

**6. Instrument: the home page did not argue its own thesis.** ✅ `bbf8d9f`
With the phylogeny readout removed (brief amendment, `ceaaf54`), `/` was
identity panel → bio → education → source line. It now ends on the three
repositories from her own GitHub, set as the same directory listing the Software
and data page uses. Three things it needed on the way: `.card__title`, so a card
title's styling stops depending on whether it is an `h2` or an `h3`;
Instrument's heading rule reaching a section supplied through `Themed`, which
`display: contents` had been hiding from the selector; and the card's metadata
column spanning the rows rather than sitting in the first one, which a wrapped
DOI had been stretching.

**7. All three: `Core research themes` renders a heading over a summary with no
themes under it.** ⏸ **Left open, deliberately.**
`src/content/pages/research.md` has the `##` and a paragraph describing the
themes in general, and then nothing enumerating them. It lands on the page in
all three designs and it is the page a visitor goes to second.

It is left open because the fix is content and the content is hers.
`AGENTS.md` is explicit: placeholder content stays visibly fake, and real
content is real — it comes from her ORCID record, her GitHub account or her own
words. Writing three research themes for a real lab and shipping them under her
name is the one thing that rule forbids, and structuring around it (rendering
the placeholder projects under her heading) would need either a dedicated route
that takes that heading out of the CMS or a reordering of her page. Both cost
more than they fix.

The fix is one edit in `/admin`: three sentences under that heading, or delete
the heading and let its paragraph join the intro above it.

**8. Record and Feature: a placeholder person appeared to hold two ranks.** ✅ `2208233`
`PeopleGrid.astro` emitted `Placeholder entry` as a second `.person__rank`,
styled identically to the first. `.person__placeholder` takes the accent in all
three designs — colour means something on this site — and then each says it in
its own vocabulary: tracked capitals, an editor's italic, a monospaced label.
Instrument had been reaching the same two paragraphs through `p:first-of-type`
and `p:last-of-type`, which would break the moment a third appeared; it now
names both.

## Could improve

**9. Project and news detail pages were the flattest page in every design.** ✅ `86add89`
A title, a grey paragraph, a note, a paragraph — and two lines of markup were
doing the converging. The project summary is now a `.lede`, which all three
designs already had a view on, and the news item's date is a `.dateline` rather
than an unnamed grey paragraph: a tracked label over a rule, an italic display
line, a monospaced identifier. Linking a project to its software and its papers
would need a relation in the content model, which is a decision about the model
rather than about the design, and is not made here.

**10. Feature set repository names in Fraunces.** ✅ `33df4c7`
`LFI_between_country_migration` in a display serif is a thing that exists
nowhere in print: the underscores hang, the optical size draws them for a
headline, and the one string on the page that has to be typed exactly was set
least like text anyone would type. `.card__title--repo` marks a title that is an
identifier, and Feature sets those in Instrument Sans. The contents-page ranking
still applies.

**11. Rule weights were hardcoded.** ✅ `1519e2e`
`shape.rule` was `1px` in all three, but the structural rules were literal `2px`
and `3px` nineteen times across `a.css` and `b.css`. `ruleStrong` and
`ruleHeavy` join `rule` on `ThemeSpec.shape` and flow through the generator.
Instrument declares all three as the same hairline, which states its position
rather than leaving it inferred from an absence — and made its `.note` override
redundant. No computed value changed.

**12. Below 928px, Record and Instrument separated on type and colour alone.** ✅ `087823d`
Both rails collapsed and both became identity → wrapping nav → prose.
Instrument's module now opens at 48rem against Record's 62: it is the design
that can afford the earlier line, with an 11rem rail against 14, the narrowest
scale of the three, and an identity panel that is already a band across the top
at that width.

## Found while fixing

**Record's inline code failed contrast.** ✅ `b4b1804`
Widening the contrast sweep to the long-form pages caught a vermilion link
inside `<code>` — `/admin` on the how-it-works page — at 4.26:1 against Record's
grey code surface, where the same words clear 4.5:1 against the page. Boxed with
a hairline rather than filled, which is the flatter answer for that design
anyway.

---

## What passed, and still does

Re-run after every change above.

- **The gate commands.** `pnpm build`, `pnpm test` (114 tests, 10 files),
  `pnpm typecheck` (0 errors) and `pnpm check:responsive` (4 viewports × 3
  designs × 11 pages) all pass clean.
- **Contrast.** Every text/background pair on 11 pages × 3 designs clears WCAG
  AA at its own size and weight, including the vermilion, lavender and viridis
  accents as link text and as ground under white.
- **Focus.** A visible 2px ring at 2px offset, in each design's own accent.
- **Headings and landmarks.** No skipped levels on any page in any design; one
  `<nav>`, one identity block, one `<main>`, one `<h1>` per page, enforced by test.
- **Images.** Every `<img>` carries `alt`. Every borrowed figure carries its
  caption, its full citation, its licence and its placeholder mark — the
  `FigurePlate` component refuses to render one without them.
- **Motion.** No transitions or animations anywhere, and a
  `prefers-reduced-motion` block regardless.
- **The stack constraint.** No parallel stylesheet: all three theme files write
  only inside the declared `base / layout / components / utilities` layers, and
  contain no colour literals and now no literal rule weights.
- **Fonts.** Archivo, Fraunces (`opsz`), Instrument Sans, IBM Plex Sans and
  Source Code Pro all resolve to their variable cuts, italics included.

## What was done

Fourteen commits, straight onto `main`, one self-contained change each:

```
69d6499  fix(themes): stop news and events inheriting the publication rail
ae8398c  fix(themes): close the empty tracks in Record's team grid
2208233  fix(people): give the placeholder mark its own class
53f5dcc  fix(themes): stack Feature's cover note above the figure on a tablet
d418dc5  feat(themes): set Feature's news and event dates as a dateline
c5ea430  fix(themes): stop Feature spending its section space twice
bbf8d9f  feat(themes): close Instrument's home page on what the lab has released
087823d  fix(themes): bring Instrument's rail in at the tablet width
33df4c7  fix(themes): set Feature's repository names in the body face
1519e2e  build(themes): generate the heavier rule weights as tokens
86add89  feat(themes): give the detail pages a voice of their own
b4b1804  fix(themes): lift Record's inline code off the grey it fails contrast on
36ccf5e  feat(site): surface the theme identity statements on how-this-works
8a9e46b  docs: describe the per-theme layout architecture
```

The last two are steps 5 and 9 of the brief, which the review found outstanding.
`/how-this-works/` now renders each design's `thesis`, `saysAboutYou`, `cost`
and `precedent` from `ThemeSpec`, with the cost lines called out first — that
page is the decision aid this review's answer belongs beside.
`docs/theme-architecture.md` is the reference for how a design differs from the
other two, which is what the ninth commit was for.

## Screenshots

`.scratch/design-review/` (gitignored), around 300 files:

- `<page>-<theme>-<viewport>.png` — full page
- `fold-<page>-<theme>-<viewport>.png` — above the fold
- `sbs-<page>-<viewport>.png` — the three designs side by side
- `sbs-pubs-mid.png` — the publications dialects aligned
- `squint.png` — six pages × three designs, blurred to thumbnails
- `how-this-works-designs-<theme>.png` — the decision aid, in each design

Pages: home, research, team, publications, software, projects, news, events,
gallery, person detail, project detail, news item, join us.
Viewports: 1280×800, 768×1024, 375×812.

Regenerate with `.scratch/shots.mjs` then `.scratch/montage.sh`, both from the
repo root, with `pnpm preview` up.
