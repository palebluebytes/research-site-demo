import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_NAMES,
  LOCALE_TAGS,
  STRINGS,
  alternatesFor,
  formatDate,
  interpolate,
  localePath,
  plural,
  t,
  type StringKey,
} from '../src/lib/i18n.ts';

/**
 * The translation gate.
 *
 * A missing translation does not throw at render time - `t` falls back to
 * English so a page still draws - which means the only thing standing between
 * a half-translated catalogue and production is this file. It is deliberately
 * the strict kind of test: every key, every locale, every build.
 *
 * The placeholder check is the one worth the most. A translator working in a
 * web UI sees `{n}` as noise and drops it, or writes `(n)`, and nothing fails:
 * the string renders, reads almost right, and is missing the number. That is
 * invisible in review and obvious to a reader.
 */

const keys = Object.keys(STRINGS[DEFAULT_LOCALE]) as StringKey[];
const others = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

/** Every `{name}` in a string, as a sorted set, so order is not compared. */
const placeholders = (value: string): string[] =>
  [...new Set(value.match(/\{(\w+)\}/g) ?? [])].sort();

describe('the catalogue is complete', () => {
  it('defines at least one string', () => {
    expect(keys.length).toBeGreaterThan(0);
  });

  it.each(others)('%s has every key the default locale has', (locale) => {
    const missing = keys.filter((key) => !(key in STRINGS[locale]));
    expect(missing).toEqual([]);
  });

  it.each(others)('%s has no key the default locale lacks', (locale) => {
    const extra = Object.keys(STRINGS[locale]).filter((key) => !keys.includes(key as StringKey));
    expect(extra).toEqual([]);
  });

  it.each(LOCALES)('%s has no empty or whitespace-only string', (locale) => {
    const blank = keys.filter((key) => (STRINGS[locale][key] ?? '').trim() === '');
    expect(blank).toEqual([]);
  });

  it.each(LOCALES)('%s is named in its own language and has a BCP 47 tag', (locale) => {
    expect(LOCALE_NAMES[locale].trim()).not.toBe('');
    expect(LOCALE_TAGS[locale]).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });
});

describe('placeholders survive translation', () => {
  it.each(others)('%s keeps every placeholder the English string has', (locale) => {
    const broken = keys
      .map((key) => ({
        key,
        expected: placeholders(STRINGS[DEFAULT_LOCALE][key]),
        actual: placeholders(STRINGS[locale][key] ?? ''),
      }))
      .filter(({ expected, actual }) => expected.join() !== actual.join());
    expect(broken).toEqual([]);
  });

  it('leaves a placeholder alone when no value is given for it', () => {
    expect(interpolate('{a} and {b}', { a: '1' })).toBe('1 and {b}');
  });

  it('substitutes every occurrence', () => {
    expect(interpolate('{n}/{n}', { n: 2 })).toBe('2/2');
  });
});

describe('plural variants come in pairs', () => {
  /*
    A `_one` without its `_other` is the shape of a half-done pluralisation,
    and it fails only on the plural path - which is usually the path nobody
    clicked before shipping.
  */
  it.each(LOCALES)('%s defines both variants wherever it defines one', (locale) => {
    const orphans = Object.keys(STRINGS[locale])
      .filter((key) => key.endsWith('_one') || key.endsWith('_other'))
      .filter((key) => {
        const twin = key.endsWith('_one')
          ? key.replace(/_one$/, '_other')
          : key.replace(/_other$/, '_one');
        return !(twin in STRINGS[locale]);
      });
    expect(orphans).toEqual([]);
  });

  it('picks the variant on the boundary English and French share', () => {
    expect(plural(1)).toBe('_one');
    expect(plural(0)).toBe('_other');
    expect(plural(2)).toBe('_other');
  });
});

describe('locale paths', () => {
  it('leaves the default locale unprefixed', () => {
    expect(localePath('en', '/')).toBe('/');
    expect(localePath('en', '/publications')).toBe('/publications');
  });

  it('prefixes every other locale', () => {
    expect(localePath('fr', '/')).toBe('/fr');
    expect(localePath('fr', '/publications')).toBe('/fr/publications');
  });

  it('offers one alternate per locale, and no duplicates', () => {
    const alternates = alternatesFor('/publications');
    expect(alternates.map((a) => a.locale)).toEqual([...LOCALES]);
    expect(new Set(alternates.map((a) => a.path)).size).toBe(LOCALES.length);
  });
});

describe('dates are formatted in the reader language', () => {
  const date = new Date('2026-03-09T00:00:00Z');

  it('differs between locales', () => {
    expect(formatDate('en', date)).not.toBe(formatDate('fr', date));
  });

  it('names the month in each language', () => {
    expect(formatDate('en', date)).toContain('March');
    expect(formatDate('fr', date)).toContain('mars');
  });

  /*
    Pinned to UTC in `formatDate` rather than left to the host. A date
    formatted in the build machine's zone makes the output depend on where it
    was built, and "9 March" becoming "8 March" on a CI runner west of the
    author is the kind of difference nobody looks for.
  */
  it('does not depend on the build machine timezone', () => {
    expect(formatDate('en', new Date('2026-03-09T00:30:00Z'))).toBe('9 March 2026');
  });
});

describe('t', () => {
  it('interpolates', () => {
    expect(t('en')('siteSummary', { name: 'A', jobTitle: 'B', institution: 'C' })).toBe(
      'A, B at C.',
    );
  });

  it('returns the translated string, not the English one', () => {
    expect(t('fr')('skipToContent')).toBe('Aller au contenu');
  });
});

/**
 * Translated content, as opposed to translated interface.
 *
 * The pages collection declares a `title_fr` alongside `title`, and both the
 * Zod schema and the CMS form are derived from that one declaration. This
 * checks the other half: that the entries actually carry it. Without this the
 * schema permits an untranslated page - the field is optional, because an
 * editor has to be able to save a draft before they have the French - and the
 * French site would quietly fall back to an English heading.
 */
describe('every page is translated', () => {
  const dir = join(import.meta.dirname, '../src/content/pages');
  const files = readdirSync(dir).filter((name) => name.endsWith('.md'));

  it('finds the pages', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  /*
    Every non-default locale, derived from LOCALES rather than listed. Adding a
    language to that array is what makes these cases appear, so a new locale
    arrives with its content requirement already enforced instead of waiting
    for somebody to remember to extend this file.
  */
  const cases = files.flatMap((name) => others.map((locale) => ({ name, locale })));

  it.each(cases)('$name carries a $locale title', ({ name, locale }) => {
    const frontmatter = readFileSync(join(dir, name), 'utf8').split('---')[1] ?? '';
    expect(frontmatter).toMatch(new RegExp(`^title_${locale}:\\s*\\S`, 'm'));
  });
});
