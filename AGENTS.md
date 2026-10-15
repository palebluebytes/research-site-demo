# AGENTS.md

A public demo of a research-group website: three designs over one content
model, in three languages. The code is the real thing, built for a real client;
the content is invented, because the client's own copy, photograph, email
address, ORCID record and co-authors are not mine to publish. `README.md` says
which is which and how the pieces fit together.

## Working here

- **Run commands through `nix develop -c <command>`.** The devShell pins pnpm,
  Node and the chromium that `pnpm check:responsive` drives.
- **Commit straight onto `main`, one self-contained change per commit.** This
  overrides the usual branch-first default. Every push touching `src/**`
  deploys, which is the point: each step goes live as it lands.
- **Verify with `pnpm build`, `pnpm test` and `pnpm typecheck`**, plus
  `pnpm check:responsive`, which needs `pnpm preview` already running.

## Facts you cannot read off the code

- **Nothing here points at a real person, organisation or record.** The ORCID
  iD `0000-0000-0000-0000` fails the ISO 7064 checksum ORCID uses, so no such
  record can exist; the DOI prefix `10.0000/` is unregistered; repository URLs
  use the reserved `.example` TLD, which cannot resolve; the email domain is
  `northmoor.example` for the same reason. If you replace any of these, keep
  that property - a placeholder that resolves is somebody else's page.
  `CREDITS.md` is the exception and is meant to be: those are licence
  attributions to real projects.
- **Three designs, and no two of their stylesheets can match one document.**
  Each is scoped to its own `data-theme`, so import order between them cannot
  matter. Record's is also the default and therefore scoped twice over -
  `[data-theme='a'], :root:not([data-theme])` - because a reader with no stored
  choice and no JavaScript still has to get a designed page.
- **A component's structure goes in `base.css`; its choices go in a design's
  own file.** The test for which is which: if a design that says nothing about
  the component would be *broken* without the rule, it is structure. Four
  components got this wrong by arriving while there was only one design, and a
  44px tap target got it wrong for long enough to ship two designs that failed
  WCAG 2.5.5 on a phone. `docs/theme-architecture.md` has the detail.
- **Three locales, and the count lives in one place.** `LOCALES` in
  `src/lib/i18n.ts` drives the `lang` attribute, every `hreflang`, the
  `x-default`, the menu, the footer switcher, the sitemap alternates and the
  test matrix. Adding a language is: that array, a catalogue object beside it,
  a `title_<locale>` field in the schema, the frontmatter in
  `src/content/pages/`, three route files under `src/pages/<locale>/`, the
  sitemap locale map, and the paths in `scripts/check-responsive.mjs`. Nothing
  in `BaseLayout.astro` or the page components is touched.
- **Interface strings and content are translated in different places, on
  purpose.** The site's own words - "Skip to content", a section heading, the
  name of a menu - are in `src/lib/i18n.ts`, because no editor should have to
  type them before the site will build. A page's title is content, so it is a
  schema field and the editor owns it.
- **`test/i18n.test.ts` is a gate, not a smoke test.** `t()` falls back to
  English rather than throwing, so a missing translation renders. That test is
  the only thing that stops a half-translated catalogue shipping, and it checks
  placeholder parity as well as presence - a translation that drops `{n}` reads
  almost right and is missing the number.
- **The site is light-only and has no dark palette.** `src/admin/` is the
  exception: the CMS shell is a tool surface and keeps its own `light-dark()`
  pairs.
- **Six of the site's sections are shelved, not deleted.** Team, Software &
  data, Projects, News, Events, Gallery and Join us hold placeholder content
  only, so they are built no longer and linked from nowhere. Their pages sit in
  `src/pages/` under a leading underscore and still typecheck; `src/lib/nav.ts`
  holds the menu entries behind a `shelved` flag and the `SHELVED_PAGES` list.
  Keep them compiling when you change anything shared.
- **`src/schema/collections.ts` is the single source for the content model.**
  It generates both the Zod schema and `public/admin/config.yml`; commit the
  regenerated config alongside any change to it.
- **Publications come from `src/data/orcid-snapshot.json`**, a committed
  snapshot. Only `pnpm sync:orcid` talks to ORCID, so builds are reproducible
  and work offline. In this demo that file is a fixture and the sync workflow
  is disabled - see `README.md`.
- **`src/lib/events.ts` still formats in `en-GB` regardless of locale.** It
  serves the shelved events page and its tests pin that output. It is the one
  piece of date handling the locale plumbing has not reached, and it is
  recorded here rather than left to be discovered.

## The design

`docs/design.md` is the design in prose: what it argues, what it costs, the
five token groups, the two-file cascade, the grid it arranges and the
invariants that are pinned by tests. Read it before any styling work -
particularly the token rule, since a literal colour or pixel weight in
`design.css` is the most common way this design goes wrong.
