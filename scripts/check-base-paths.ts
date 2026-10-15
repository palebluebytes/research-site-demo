/**
 * Fail the build if any emitted URL ignores the base path, or points at
 * nothing.
 *
 * This exists because it already happened twice, in opposite directions.
 *
 * First, links went through the base-path helper and media did not, so every
 * image 404'd on the deployed project path while working perfectly at the site
 * root locally. A broken link is obvious; a broken <img> quietly shows nothing.
 *
 * Then the base was applied *twice* - a bundler-resolved URL, which already
 * carries it, handed to a helper that adds it again. The original check passed
 * that: it asked whether a path started with the base, and
 * `/base/base/x.svg` does. So the question is now whether the file is there,
 * which is the thing actually being got wrong both times and cannot be
 * satisfied by a path that merely looks right.
 *
 * Checking existence also means this runs at a site root, where the old check
 * exited immediately and verified nothing - which is exactly the build a
 * developer runs locally before pushing.
 *
 * Usage: node scripts/check-base-paths.ts (after `astro build`)
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const base = (process.env.SITE_BASE ?? '/').replace(/\/+$/, '');

async function* htmlFiles(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

// Root-relative href/src values only: absolute URLs, fragments and relative
// paths resolve themselves and are none of this check's business.
const ROOT_RELATIVE = /(?:href|src)="(\/[^"]*)"/g;

const exists = async (path: string): Promise<boolean> => {
  try {
    const info = await stat(path);
    // A directory URL is served by the index.html inside it.
    if (info.isDirectory()) return exists(join(path, 'index.html'));
    return true;
  } catch {
    return false;
  }
};

const ignoresBase: string[] = [];
const missing: string[] = [];

for await (const file of htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  for (const [, raw] of html.matchAll(ROOT_RELATIVE)) {
    // Query and fragment are the server's business, not the filesystem's.
    const path = raw!.split(/[?#]/)[0]!;
    if (path === '') continue;

    if (base !== '' && !(path.startsWith(`${base}/`) || path === base)) {
      ignoresBase.push(`${relative(DIST, file)}: ${path}`);
      continue;
    }

    /*
     * Strip the base to get back to a path inside dist/. A doubled base
     * survives this as a leading copy of itself, which is then simply a file
     * that is not there - so it is caught by the same check as a typo rather
     * than needing a rule of its own.
     */
    const withinDist = base === '' ? path : path.slice(base.length);
    if (!(await exists(join(DIST, withinDist)))) {
      missing.push(`${relative(DIST, file)}: ${path}`);
    }
  }
}

const report = (label: string, offences: string[], advice: string): void => {
  if (offences.length === 0) return;
  console.error(`check-base-paths: ${offences.length} URL(s) ${label}:`);
  for (const offence of offences.slice(0, 20)) console.error(`  ${offence}`);
  if (offences.length > 20) console.error(`  ...and ${offences.length - 20} more`);
  console.error(`  ${advice}\n`);
};

report(
  `ignore the base path "${base}"`,
  ignoresBase,
  'Every root-relative href and src must go through url() from src/lib/paths.ts.',
);
report(
  'point at a file that is not in dist/',
  missing,
  'Usually the base applied twice: url() resolves a site-root path, so never hand it one a bundler has already resolved.',
);

if (ignoresBase.length > 0 || missing.length > 0) process.exit(1);

console.log(
  base === ''
    ? 'check-base-paths: every root-relative URL resolves to a file in dist'
    : `check-base-paths: every root-relative URL respects "${base}" and resolves to a file in dist`,
);
