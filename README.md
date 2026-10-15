# research-site-demo

A multilingual research-group website: **three designs over one content model**,
three locales, and a CMS a non-technical owner can run without help.

**The code is real and the content is not.** This is a site I built for a
research group, with every piece of the client's own material taken out. Their
copy, photograph, email address, institution, ORCID record and co-authors are
not mine to publish, so the text here is placeholder, the people are invented,
and the identifiers are constructed so that none of them can resolve to anyone:
the ORCID iD fails ORCID's own checksum, the DOI prefix is unregistered, and
the repository and email domains use the reserved `.example` TLD. Nothing here
points at a real person or organisation. `CREDITS.md` is the one exception, and
it is meant to be - those are licence attributions.

What is left when the content goes is the part worth showing: the content
model, the editing surface, the translation machinery, the three designs and
the test suite.

## What to look at first

**Three designs, one build, switched at runtime.** The control sits bottom
right. Record is achromatic and gridded and stands behind the work; Feature
sets a display serif over a warm ground and argues that a figure carries the
evidence; Instrument sets every identifier in monospace on a labelled panel and
treats the site as something the group keeps. Each carries its own written
thesis, what it says about whoever runs the site, and — the field that earns
its place — what it costs, in `src/lib/themes.ts`.

Every section is built, in every language: home, research, publications,
software and data, projects, news, team, events, gallery and a join-us page,
plus an item page for each project, news item and person. Eighty pages. That
is not padding - a prose page, a card grid, a dated list, a photo grid and a
person's record are five different problems, and a design that handles the
first well can still fall over on the third. Three designs cannot be compared
on one page shape.

The content, the routes, the markup and the three locales are identical across
all three. That constraint is the point: anything that differs between them is
a design decision rather than a difference in what there was to design, which
is what makes comparing them worth anything. `docs/theme-architecture.md` is
the map of exactly which levers a design may pull.

**One content spec, three derivations.** `src/schema/collections.ts` describes
every collection once. `src/content.config.ts` turns it into Zod schemas that
fail the build on a bad entry, and `scripts/generate-cms-config.ts` turns it
into `public/admin/config.yml`, which decides what the CMS form offers. The CMS
cannot offer a field the build would reject, because neither side is written by
hand. `test/rendered-fields.test.ts` closes the other end: every field the form
offers has to be rendered somewhere, so an editor cannot fill in a box whose
contents never appear.

That is also how a translated field is declared. `title_fr` and `title_es` are
one line each in the spec; the validator and the form both follow. Keeping a
translated field definition in step with its original is the failure this shape
removes, rather than a convention somebody has to remember.

**Translation is split in two, deliberately.** The site's own words - the skip
link, the section headings, the name of the menu - live in `src/lib/i18n.ts`,
because no editor should have to type "Skip to content" before the site will
build. A page's title is content, so it is a schema field and the editor owns
it. `LOCALES` in that one file drives the `lang` attribute, every `hreflang`,
the `x-default`, the menu, the footer switcher, the sitemap alternates and the
test matrix; `BaseLayout.astro` names no language at all.

**`test/i18n.test.ts` is a gate.** `t()` falls back to English rather than
throwing, so a missing translation renders a page that looks fine and is wrong.
That test is what stops it shipping: every key in every locale, no blanks, both
plural variants wherever one exists, and - the one that earns its keep -
placeholder parity, because a translator working in a web UI sees `{n}` as
noise and drops it, and a sentence missing its number reads almost right.
Placeholders are named rather than positional for the same reason: `%s` cannot
be reordered by a translator, which breaks the first language whose clause
order differs from English's.

**Accessibility is tested, not claimed.** `test/contrast.test.ts` computes WCAG
ratios from the actual tokens and asserts AA for text and non-text across four
surfaces - the card is the binding one, and a colour picked against the page
alone passes there and fails it. `test/reading-order.test.ts` and
`test/single-emission.test.ts` pin one primary landmark, one `<main>`, one
`<h1>` per page, and the in-page index rendering directly after the heading it
indexes. `scripts/check-responsive.mjs` drives real Chromium over every page in
every locale at four viewports, asserting 44px touch targets, a 16px floor for
body text on a phone and no horizontal scroll. The locales are in that list on
purpose: French and Spanish run longer than English, so the layout that
overflows is the translated one on the narrowest screen.

**The owner's manual is part of the product.** `src/pages/how-this-works.astro`
is a plain-English manual for whoever edits the site, kept out of the menu and
`noindex`. Its numbers are computed from the same data the site renders, so it
cannot drift into describing a site that no longer exists. It is English-only,
which is a content decision rather than a gap: it is written for one editor,
not for the site's readers.

## Running it

```sh
direnv allow      # or: nix develop
pnpm install
pnpm dev
```

Then open <http://localhost:4321>.

| Command | Does |
| --- | --- |
| `pnpm dev` | Regenerate the CMS config, vendor Sveltia, start the dev server |
| `pnpm build` | Same, then build to `dist/`, then check every root-relative URL honours `base` |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm typecheck` | `astro check && tsc --noEmit` |
| `pnpm check:responsive` | Drive a real browser over every page, locale and viewport (needs `pnpm preview` running) |

## How it fits together

**One design, in two files.** `src/lib/design.ts` holds its tokens - one face,
a Utopia type and space scale, a colour set, seven shape values - and
`src/components/Tokens.astro` emits them as custom properties on `:root`.
`src/styles/base.css` is the reset, the shared components and the default
single-column arrangement; `src/styles/design.css` extends the same cascade
layers with everything that is a choice the design made. No literal colours or
pixel weights live in the stylesheet: a value in there is a token that has not
been named yet.

**Routing.** The default locale is unprefixed and the others sit under
`/fr/` and `/es/`; `hreflang` and `x-default` are what tell a crawler that the
unprefixed URLs are the English ones. A page routed in three languages is still
one page, so the markup lives in one component under
`src/components/pages/` and the route files under `src/pages/` are three lines
each. `base` lets the same build serve from a GitHub Pages project path or from
a domain root, and `scripts/check-base-paths.ts` fails the build if any
root-relative URL - media included - forgets it.

**Publications** come from `src/data/orcid-snapshot.json`, a committed
snapshot, so builds are reproducible and work offline. In the real deployment
`.github/workflows/sync-orcid.yml` re-fetches the record daily and commits the
snapshot only when it changed. Here the snapshot is a fixture and that workflow
is disabled, because there is no real record to sync.

**Events and gallery are fixtures.** `src/data/fixtures/` holds data shaped
exactly like `@palebluebytes/cms` returns, so wiring a real Google Calendar and
Drive folder later is a one-line swap for `fetchEvents()` / `fetchPhotos()`.
Both pages are shelved; see `src/lib/nav.ts`.

## What is real and what is not

| Real | Invented |
| --- | --- |
| The content model, and both derivations from it | Every name, title, abstract and affiliation |
| The translation machinery, and the French and Spanish copy | The ORCID record and every DOI |
| The design, the tokens and the stylesheet | The portrait, which is a generated placeholder |
| The CMS configuration and the editing flow | The institution, the email domain and the repository URLs |
| The test suite and the browser checks | The news items, projects and team, which are shelved anyway |

## Known gaps

Stated here rather than left to be found:

- **No image pipeline.** There is no `astro:assets`, no `srcset` and no format
  negotiation. One portrait did not justify it; a gallery would.
- **No forms.** No contact form and no server - `dist/` is plain static files.
- **`src/lib/events.ts` formats dates in `en-GB` whatever the locale.** It
  serves the shelved events page and its tests pin that output, so it is the
  one piece of date handling the locale work has not reached.
- **The manual is English-only**, as above.

## Deployment

GitHub Actions builds and deploys to GitHub Pages. There is no server, no
Cloudflare Worker, and no platform-specific code. See
`.github/workflows/deploy.yml`.

## Editing

See [docs/cms-access.md](docs/cms-access.md).
