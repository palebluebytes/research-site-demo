import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { COLLECTION_NAV, NAV, SHELVED_PAGES } from '../src/lib/nav.ts';

/**
 * Shelved sections are linked from nowhere.
 *
 * `COLLECTION_NAV` is the whole list, shelved entries included, and it exists
 * so that bringing a section back is deleting one word. `NAV` is the filtered
 * list, and it is the only one a page may render. The difference is invisible
 * at the call site — both are arrays of `{ label, href }` that map to links
 * that look perfectly correct — and rendering the wrong one publishes a menu
 * of dead ends.
 *
 * Which is what happened: the 404 page, whose entire job is to get someone
 * unstuck, mapped `COLLECTION_NAV` and offered nine links of which six were
 * 404s. A reader who mistyped a URL was handed six more ways to mistype it.
 * Nothing failed, nothing warned, and `pnpm check:responsive` drives only the
 * pages that are built, so it never followed one.
 *
 * Routed pages are the ones without a leading underscore. The shelved pages
 * themselves still import whatever they like: they are compiled, not served.
 *
 * Nothing is shelved at the moment - this is a design demo, and every page
 * shape earns its place by being another thing to compare three designs on.
 * The rule is still asserted rather than the state: with the list empty these
 * checks are satisfied trivially, and the day something goes back on the shelf
 * they bite again without anyone having to remember to re-enable them. A test
 * deleted because it currently proves nothing is a test nobody writes twice.
 *
 * Comments are stripped before matching, as in test/single-emission.test.ts:
 * the fix for this on 404.astro is a comment naming both lists and saying
 * which one to reach for, and a naive match reads that as the mistake.
 */
const PAGES = new URL('../src/pages/', import.meta.url).pathname;
/*
 * The page bodies moved here when each page began being routed once per
 * locale: a route file is three lines and the markup that could render the
 * wrong menu is in the component. Scanning only `src/pages/` would now be
 * scanning the three-line files.
 */
const PAGE_COMPONENTS = new URL('../src/components/pages/', import.meta.url).pathname;

/** Explaining a rule must not break it. Same treatment as single-emission. */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
}

/** Astro does not route a file or directory whose name starts with `_`. */
const isRouted = (path: string) =>
  !relative(PAGES, path)
    .split('/')
    .some((segment) => segment.startsWith('_'));

function routedPages(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return isRouted(path) ? routedPages(path) : [];
    return path.endsWith('.astro') && isRouted(path) ? [path] : [];
  });
}

const pages = [...routedPages(PAGES), ...routedPages(PAGE_COMPONENTS)];
const shelvedHrefs = COLLECTION_NAV.filter((item) => item.shelved).map((item) => item.href);

describe('the shelved sections are linked from nowhere', () => {
  it('finds the routed pages to check', () => {
    // A glob that quietly matches nothing would pass every assertion below.
    expect(pages.length).toBeGreaterThan(0);
  });

  it('agrees with itself about what is shelved', () => {
    // Vacuous while nothing is shelved, and that is the point: the rule holds
    // either way, so the list can empty and refill without this file changing.
    expect(shelvedHrefs.every((href) => href.startsWith('/'))).toBe(true);
    expect(SHELVED_PAGES.every((id) => !id.startsWith('/'))).toBe(true);
  });

  it.each(pages.map((path) => [relative(PAGES, path), path]))(
    '%s renders the filtered menu, not the whole list',
    (_name, path) => {
      expect(withoutComments(readFileSync(path, 'utf8'))).not.toMatch(/\bCOLLECTION_NAV\b/);
    },
  );

  it.each(pages.map((path) => [relative(PAGES, path), path]))(
    '%s links no shelved href directly',
    (_name, path) => {
      const source = withoutComments(readFileSync(path, 'utf8'));
      const linked = [...shelvedHrefs, ...SHELVED_PAGES.map((id) => `/${id}`)].filter((href) =>
        // Quoted, so `/team` does not match a sentence that mentions the team.
        new RegExp(`['"\`]${href}/?['"\`]`).test(source),
      );
      expect(linked).toEqual([]);
    },
  );

  it('leaves NAV as the subset that is actually built', () => {
    expect(NAV.every((item) => !item.shelved)).toBe(true);
    expect(NAV.length).toBe(COLLECTION_NAV.length - shelvedHrefs.length);
  });
});
