# Theme identity brief — belman-lab-demo

The three candidate designs currently differ only in colour and system font stack.
This brief turns them into three designs with separate identities, using an
established skill rather than a new one.

Settled across five rounds of interview. Execution order is at the bottom.

---

## Step 0 — install the skill

The chosen skill is **`frontend-design` from julianoczkowski/designer-skills**
(Apache-2.0, 542 stars). It is a strict superset of Anthropic's installed
`frontend-design`: same anti-generic clauses, plus eight named aesthetic
philosophies each specified across six axes, plus a mandatory codebase scan
before writing. Already cloned locally but not symlinked, so Claude Code cannot
currently see it.

```sh
git -C /home/inkpotmonkey/code/skills/designer-skills pull
ln -s /home/inkpotmonkey/code/skills/designer-skills/frontend-design \
      ~/.claude/skills/designer-frontend-design
ln -s /home/inkpotmonkey/code/skills/designer-skills/design-review \
      ~/.claude/skills/designer-design-review
```

Renamed on symlink because `~/.claude/skills/frontend-design` already resolves to
Anthropic's. Both stay installed; they are complementary.

Re-read `designer-frontend-design/SKILL.md` after the pull — the constraint block
below was written against commit `d90b927` and the philosophies could have moved.

**No skill in the ecosystem generates N deliberately divergent directions** —
every one commits to a single aesthetic per run. The non-overlap constraint is
therefore supplied by the prompt, not the skill. That is what the shared block is.

---

## Step 1 — shared machinery (no design decisions)

One commit, before any theme work. Nothing here should change how a page looks.

1. **Drop dark mode.** `ThemeSpec.colors` becomes `Record<string, string>` instead
   of `[light, dark]` tuples. `Tokens.astro` stops wrapping values in
   `light-dark()`. `:root { color-scheme: light dark }` becomes `light`.
   Leave `src/admin/index.template.html` untouched — the CMS shell is a tool
   surface, not a candidate design.
2. **Widen `ThemeSpec`** with the identity statement fields:
   `thesis`, `saysAboutYou`, `cost`, `precedent` — all strings. The existing
   one-line `description` stays as the switcher's short form.
3. **Per-theme layout slots.** A theme may supply its own layout and its own
   component variants. Content model, routes and page content stay shared.
4. **Add Fontsource** deps and imports (packages pinned below).
5. **Add a `software` collection** to `src/schema/collections.ts`. One
   declaration flows into both the Zod schema and `public/admin/config.yml`
   through the existing generator. Real content — her GitHub is `sophbel`.
6. **Split the responsive floors** in `scripts/check-responsive.mjs`: touch
   targets to 44px, body text ≥16px on mobile, 12px retained as the floor for
   fine print only.
7. **Add a test** asserting single emission — exactly one `<nav>` primary
   landmark, one identity block, one `<main>` per page, in every theme.
   Precedent: `test/astro-whitespace.test.ts` pins a subtler invariant already.
8. **Rewrite the two prose claims the change invalidates**: the README's "No
   theme has its own stylesheet, which is what keeps the switcher cheap", and the
   `@layer layout` comment in `base.css` about one grid and three arrangements.

---

## The shared constraint block

Prepend verbatim to each of the three runs.

> ### Stack facts
>
> Astro 7 static site, no framework components. Design tokens are generated:
> `src/lib/themes.ts` declares each theme as a `ThemeSpec`, and
> `src/components/Tokens.astro` emits all themes' tokens into one global
> stylesheet scoped to `:root[data-theme="<id>"]`. `src/styles/base.css` declares
> the cascade layer order `reset, base, layout, components, utilities` and
> consumes the tokens.
>
> **Do not write a parallel stylesheet.** Extend `ThemeSpec`, extend the
> generator, and add `:root[data-theme='x']` rules inside the existing layers.
>
> **`data-theme` means which of the three designs, not colour mode.** The site is
> light-only; there is no dark palette and no `light-dark()`. Ignore the skill's
> instruction to support a `[data-theme="dark"]` attribute — it would fight the
> design switcher.
>
> Type and space are fluid Utopia scales interpolating over 320–1240px, exposed as
> `--step--1`…`--step-5` and `--space-3xs`…`--space-3xl`. Use those tokens; do not
> hard-code px sizes.
>
> ### Typography
>
> Self-hosted via Fontsource npm packages. **Ignore the skill's instruction to
> load fonts from Google Fonts or a CDN**, and ignore its named faces — several
> are commercial (Neue Haas Grotesk, Suisse Intl, Akkurat, Circular, Cera Pro)
> and several of its open suggestions have no variable cut on Fontsource at all
> (Instrument Serif is a single 400 weight; Spectral, DM Serif, Zilla Slab and
> IBM Plex Serif/Mono are static-only). Use only the packages pinned per theme.
>
> Every face must be variable. Three mechanics that fail silently:
>
> - The CSS family name carries a ` Variable` suffix: `'Archivo Variable'`.
> - Italic is always a **separate import** — `@fontsource-variable/x/wght-italic.css`.
>   Body text needs it: the content is full of species names like
>   *Streptococcus pneumoniae*, and a synthesised oblique on these faces looks broken.
> - A bare `import '@fontsource-variable/x'` resolves to the **`wght`-only** build,
>   contrary to the Fontsource docs. To use an optical-size axis, import
>   `opsz.css` **and** `opsz-italic.css`; never mix an `opsz` roman with a `wght`
>   italic.
>
> Weight is exposed as a range on the `@font-face`, so `font-weight: 550`
> interpolates without `font-variation-settings`. Reach for
> `font-variation-settings` only for custom axes (`opsz` applies automatically via
> `font-optical-sizing: auto`).
>
> ### Invariants
>
> - Navigation, identity and `<main>` are each emitted **exactly once** per page.
>   A per-theme layout that emits a second nav puts two "Primary" landmarks and
>   every link twice into the page. A test enforces this.
> - The measure constrains prose, not the column — `--measure` applies to
>   paragraphs and headings, never to a grid container.
> - `pnpm check:responsive` gates every page at 320/390/768/1440: touch targets
>   ≥44px, body text ≥16px on mobile, no text below 12px.
> - `pnpm test` and `pnpm typecheck` pass.
>
> ### What this direction must not take from the others
>
> Six axes. Each direction owns its own value and may not use another's:
>
> | Axis | A — Record | B — Feature | C — Instrument |
> |---|---|---|---|
> | Type classification | Neo-grotesque, one family | Display serif + editorial sans | Monospace + humanist sans |
> | Hue family | Achromatic + vermilion | Warm off-white + lavender/aubergine | Cool monochrome + viridis accent |
> | Layout grammar | Strict modular grid, sidebar | Asymmetric magazine, varied column widths | Full-width identity panel over a narrow menu rail |
> | Hero treatment | Name + discipline strapline, no image | Question-as-hero over a paper figure | Keyed identity panel with portrait, unchanged on every page |
> | Motif | The grid made visible — hairline rule system | Real paper figures, citation in caption | Labelled key/value metadata; one filled accent square |
> | Publications dialect | Year-railed list | Annotated "selected findings" cards | Compact citation rows with DOI |
>
> ### Targets
>
> Lead with the science. Put the lab's own name above any institutional
> taxonomy. Give every borrowed or published image a caption and a credit; a
> portrait of the person whose page it is needs neither. Let people and research
> reach the reader before media coverage does. Make the page work at 320px first
> and add complexity upward.

---

## Run A — Record

> Use the designer-frontend-design skill.
>
> [shared constraint block]
>
> Build theme A, "Record", pinned to the **Swiss / International Typographic**
> philosophy from the skill. This is the credibility pole: it should read as
> institutional and objective, the kind of page EMBL-EBI or a Sanger group runs.
> It is the direction Sophie picks if she wants the site to disappear behind the
> work.
>
> Typeface: **Archivo** alone — `@fontsource-variable/archivo` plus
> `/wght-italic.css`. One family used strictly, with weight and scale contrast
> doing the work a second family would otherwise do. Archivo also carries a
> `wdth` axis; check which axis build exposes it and what that costs before
> relying on condensed headlines, and fall back to the `wght` build if the full
> build is heavy.
>
> Palette: achromatic. Paper white, near-black, greys defined by the grid rather
> than by decoration, and exactly one functional accent — a Swiss vermilion.
> Colour is information, never ornament.
>
> Structure: strict modular grid with the gutters visible as part of the design.
> Name and discipline as a two-line strapline unit, repeated as the site's
> signature. A sticky in-page section index above the fold on long pages. Alumni
> collapsed into an accordion on the team page. A funder acronym strip with the
> names spelled out. No photography anywhere except a single credited image.
>
> The trap: Swiss is also the default serious-website answer, so an ordinary
> execution reads as a template rather than a design. Earn it with an unusual
> grid or an unusual ranking of content, and with rules used structurally.
>
> Also write this theme's identity statement into its `ThemeSpec`: `thesis`,
> `saysAboutYou`, `cost` (the honest trade — what she gives up by choosing it),
> and `precedent`.

## Run B — Feature

> Use the designer-frontend-design skill.
>
> [shared constraint block]
>
> Build theme B, "Feature", pinned to the **Editorial / Magazine** philosophy
> from the skill. This is the communication candidate: the site as a place where
> the science is told, not just listed. It is the direction Sophie picks if she
> wants a visitor to understand what she works on within one screen.
>
> Typefaces: **Fraunces** for display — `@fontsource-variable/fraunces/opsz.css`
> and `/opsz-italic.css`, optical size 9–144 covering hero through caption from
> one file — over **Instrument Sans** for body,
> `@fontsource-variable/instrument-sans` plus `/wght-italic.css`. If Fraunces
> renders too soft against the content, substitute `@fontsource-variable/playfair`
> (the superfamily with `opsz` 5–1200, **not** `playfair-display`).
>
> Palette: warm off-white ground, ink black, and **her existing lavender/aubergine
> carried forward** — this is the one direction that keeps continuity with her
> current site, so that continuity becomes something she can actively choose
> rather than something imposed.
>
> Structure: research themes framed as questions rather than topic labels. Real
> paper figures as the imagery system, each with its citation in the caption —
> this is the motif, and it does a job rather than decorating. Varied card sizes
> mirroring a contents page. Pull quotes, hairline rules, kickers. Generous scale
> contrast between display and body.
>
> Placeholder imagery comes from Wikimedia Commons with per-file attribution
> added to `CREDITS.md`, matching how that file already documents borrowing.
> Mark placeholders visibly, as the team page already marks placeholder people.
>
> Also write this theme's identity statement into its `ThemeSpec`: `thesis`,
> `saysAboutYou`, `cost`, `precedent`.

## Run C — Instrument

**Amended 2026-09-09, after the run.** Two things below did not ship, and the
matrix above has been corrected to describe what did. The run prompt itself is
left as it was written, as the record of what was asked for.

The rendered artefact is gone. The phylogeny readout made the front page a stack
of eight blocks before the first sentence, and it was removed along with its
component, fixture and layout code — recoverable from the commit that added it,
`ceaaf54`. The identity block then moved out of the rail into a panel across the
top of every page, carrying the portrait and five facts each labelled with the
field it came from, and the rail narrowed to hold the menu alone.

Two consequences the design review should weigh rather than treat as settled.
This direction no longer occupies the live-data-visualisation position the
research found unoccupied across two dozen lab sites, and nothing else on the
site occupies it either — so that separator is not being taken. And with a
left-hand column and a hairline rule system in both, the distance between Record
and Instrument is now smaller than this matrix originally promised; whether it
is still enough is exactly the question step 6 exists to answer.

> Use the designer-frontend-design skill.
>
> [shared constraint block]
>
> Build theme C, "Instrument". The skill has no philosophy that fits, so use this
> authored one in its place — same six axes, same contract:
>
> > **Computational / Instrument.** The site is an instrument the lab built, not
> > a brochure about it. Precision over polish; the data is the ornament.
> >
> > - **Typography**: Monospace carries metadata, navigation, figures and
> >   citations; a humanist sans carries prose. Tabular figures, right-aligned
> >   numbers. Scale contrast is small — hierarchy comes from weight, case and
> >   rules, not size.
> > - **Colour**: Cool near-monochrome, light-first. Exactly one accent, taken
> >   from a scientific colormap so the interface and any rendered data share a
> >   colour language. High data-ink ratio: no gradients, no shadows, no card fills.
> > - **Layout**: A dense metadata rail against a full-width zone the data
> >   artefact can occupy. Content ranked by recency and reproducibility rather
> >   than by prominence.
> > - **Spacing**: Tight and regular. Compression is the point; whitespace is
> >   structural, not luxurious.
> > - **Motion**: Effectively none. State changes are instant.
> > - **Details**: Hairline rules instead of card borders. Monospaced dates and
> >   identifiers. A build or revision line in the footer. "Edit on GitHub"
> >   affordances. Nothing rounded.
>
> Typefaces: **IBM Plex Sans** for prose — `@fontsource-variable/ibm-plex-sans`
> plus `/wght-italic.css` — with **Source Code Pro**,
> `@fontsource-variable/source-code-pro` plus `/wght-italic.css`, carrying
> metadata, navigation and figures. Plex Mono is not variable, which is why the
> mono partner comes from elsewhere.
>
> Structure, and the reason this direction exists: across roughly 24 lab and
> institute sites parsed from raw markup, **live data visualisation is entirely
> absent** — zero canvas or charting libraries, SVGs used only as icons, true
> even of bedford.io. A homepage that renders a real tree, map or dataset is an
> unoccupied position rather than a convention. Take it.
>
> Render the artefact from a **fixture shaped exactly as real data would arrive**,
> stored in `src/data/fixtures/` alongside the existing events and gallery
> fixtures, so wiring real data later is a one-line swap. Label it a placeholder
> as everything else is labelled.
>
> Give **Software and Data top-level navigation parity with Publications**, named
> individually, using the `software` collection added in the shared machinery
> step. The research names this the single fastest separator from a generic
> university template.
>
> Also write this theme's identity statement into its `ThemeSpec`: `thesis`,
> `saysAboutYou`, `cost`, `precedent`.

---

## Step 5 — surface the identity statements

Extend the existing `designs` section of `src/pages/how-this-works.astro` — the
section is already there, titled "The design switcher" — to render each theme's
four statement fields from `ThemeSpec`. Read them from the theme data rather than
retyping them, the way the rest of that page reads live numbers from the data it
renders. The page is `noindex` and off-menu, which is correct: this is her
decision aid, not a visitor's.

The `cost` line is the point of the exercise. Three sales pitches produce no
decision; naming what each direction gives up is what makes the page usable.

## Step 6 — the gate

```sh
pnpm build && pnpm preview &
pnpm check:responsive
pnpm test && pnpm typecheck
```

Then run **designer-design-review** across all three themes. It is hard-gated on
capturing screenshots of the running application — "code review alone is
insufficient" — which is exactly right here, because the failure mode being fixed
is one that is invisible while reading your own CSS. The question it must answer:
placed side by side, do these three read as three designs or as one design with a
tint control?

## Commit plan

Straight onto `main`, one self-contained change per commit. This is a demo of
what we can build for her, not production work, and `main` deploys on every push
touching `src/**` — so each step goes live as it lands. That is the point: after
commit 5 the live switcher shows one finished design against two unchanged ones,
which is the clearest possible view of what the work buys.

1. `refactor(themes): drop dark mode and widen the theme spec`
2. `build(fonts): self-host variable faces via Fontsource`
3. `feat(schema): add a software collection`
4. `test(responsive): split the body-text and fine-print floors`
5. `feat(themes): give Record a Swiss identity` ← **stop here for review**
6. `feat(themes): give Feature an editorial identity`
7. `feat(themes): give Instrument a computational identity`
8. `feat(site): surface theme identity statements on how-this-works`
9. `docs: describe the per-theme layout architecture`

**Status at 2026-09-10.** All nine commits have landed on local `main`, along
with the step 6 review and the work it asked for. Nothing has been pushed, so
nothing is live and the switcher has still never been seen outside a preview.

The gate has been run and its answer is three designs, not one design with a
tint control — see `docs/theme-identity-review.md` for the evidence, the
twelve findings and what was done about each. One is left open on purpose:
`## Core research themes` in `src/content/pages/research.md` is a heading over
a summary with no themes under it, and the fix is three sentences of Sophie's
own words in the CMS rather than three of ours.

`docs/theme-architecture.md` is the reference the ninth commit produced: the
five levers a design has, and the invariants every one of them keeps.

One theme at a time, and never two at once. Themes B and C must avoid what A
chose; agents working concurrently cannot see each other and would converge on
the same safe answers, which is the failure being corrected. Where a later theme
runs in a fresh session, it honours non-overlap by reading the six-axis matrix
above plus the committed `ThemeSpec` entries of whatever is already built.
