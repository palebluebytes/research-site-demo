# How a design differs from the others

Three designs share one set of markup, one content model, one set of routes and
three locales. The switcher swaps `data-theme` on `<html>` and nothing else: no
reload, no second page, no second copy of the content. Everything a design can
change, it changes from inside that constraint.

That constraint is the point. If a design could also change the copy, a
comparison between two of them would be a comparison of two sites, and the
thing being judged would stop being the design. It also keeps the switcher
honest in a second way: anything that cannot be done from inside it is a thing
none of the three designs can do.

This is the map of the levers, in the order you would reach for them.

---

## 1. Tokens — `src/lib/themes.ts`

Each design is a spec: two or three faces, a Utopia type scale, a space scale, a
colour set, and seven shape values. `src/components/Tokens.astro` turns every
design into one block of custom properties scoped to
`:root[data-theme="<id>"]`, plus an unscoped block carrying the default so a
reader with no stored choice and no JavaScript still gets a designed page.

Most of what separates these three is here. Feature's type scale runs about six
times its body size at the large end where Record's runs three and Instrument's
runs two, and that single number does more to separate them than any rule in
any stylesheet.

Record's spec lives in `src/lib/design.ts` rather than beside the other two.
That is not tidiness: it is the design the site ships, its tests read it from
there, and a second copy for the sake of a uniform list is a copy that goes
stale.

## 2. Arrangement — each design's own stylesheet

`src/styles/design.css` is Record's, `src/styles/themes/b.css` is Feature's,
`src/styles/themes/c.css` is Instrument's. Every rule in each is scoped to its
own `data-theme`, so no two of them can match the same document and the order
they are imported in does not matter. A cascade race between designs is not
something that can happen here.

Record's is scoped with two selectors rather than one —
`[data-theme='a'], :root:not([data-theme])` — because it is also the default.
It was written when there was only one design and addressed `:root` directly;
the whole file is now nested inside that scope rather than prefixed rule by
rule, so the rules inside are still reviewable as themselves.

## 3. Shared structure — `src/styles/base.css`

The reset, the shared components, and the single-column arrangement every
design starts from.

The rule that matters here is about where a *new* component's defaults go.
While there was only one design, a component added to the site put both its
structure and its expressive choices into that design's stylesheet, because
there was no visible difference between the two. There is now: structure
belongs in `base.css` where every design inherits it, and choices belong in a
design's own file. The in-page index, the icon, the language switcher and the
duplicated publication year all arrived during the period when one design was
the only design, and all four had to be split back apart.

The test for which is which: if a design that says nothing about a component
would be *broken* without the rule, it is structure.

## 4. Markup that only some designs show — `src/components/Themed.astro`

The switcher swaps designs without reloading, so a variant cannot be chosen at
build time: every variant ships in every page, and each design's stylesheet
reveals the ones that are its own. `.themed` is `display: none` in `base.css`
and each design ends its stylesheet with the one line that reveals its own.

Hidden by default, revealed by name — not the other way round. A design that
forgets to hide a variant would otherwise show three stacked blocks, which
reads as a layout bug somewhere else entirely; a design that forgets to reveal
one shows a missing block, which is obvious.

`display: none` rather than visually hidden, because a screen reader should
hear one version of the page and not three.

Two things this is not for. It is not for landmarks: navigation, the identity
block and `<main>` are emitted exactly once, and `test/single-emission.test.ts`
enforces that. And it is not for bulk — three copies of the publication list is
three copies in the HTML. Where a difference can be made with CSS over one
piece of markup, make it with CSS.

The one component that earns it is `FigurePlate`. Feature's argument is that a
figure carries the evidence where the other two carry a list, so a Feature with
no figure has had its thesis removed; Record spends its single image on a
portrait, and Instrument's position is that a chart belongs in the paper it
came from. The image is `loading="lazy"` even above the fold for exactly this
reason: the two designs that never show it never fetch it either.

## 5. Keys and labels in the markup

Instrument sets the identity block as a keyed metadata rail, so each line needs
the name of the field it came from. Those keys are real text in the markup —
`role`, `title`, `dept`, `inst` — hidden by `base.css` and shown only by the
design that uses them. Written as markup rather than generated in CSS so a
screen reader reads them and a translator can reach them; to the other two
designs a hidden `<span>` inside a `<p>` changes nothing about the `<p>`.

---

## What is checked

`test/contrast.test.ts` computes WCAG ratios from the actual tokens for **every**
design, not only the default: a palette nobody checked is a palette somebody can
be looking at. Grounds a design does not declare are skipped rather than failed,
since Feature's `wash` and Instrument's `hairline` are each one design's idea.

The neutral-grey rule is asserted for Record alone. Feature's greys are warm
because a neutral grey next to its ground reads as dirty, and Instrument's are
cool for the same reason in the other direction — so that rule is one design's
argument rather than a property of the palette system, and asserting it across
all three would fail two designs for doing what they say they do.

`scripts/check-responsive.mjs` drives a real browser over every page, in every
locale, at four viewports, in every design — 132 page states. The designs were
the last axis added to it, and adding them paid for itself immediately: on a
phone, Feature's and Instrument's menu, footer and language links came out
between 18px and 27px against a 44px floor, because the rule that set that
floor lived in the one design that had ever been checked. It is in `base.css`
now, where structure belongs.
