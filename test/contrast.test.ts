import { describe, it, expect } from 'vitest';
import { DESIGN } from '../src/lib/design.ts';
import { THEMES } from '../src/lib/themes.ts';

/**
 * The palette's contrast claims, checked rather than asserted in a comment.
 *
 * `lib/design.ts` states four ratios in prose and they were all true when it
 * was written. Prose does not fail a build, and the accent has already been
 * replaced twice - one of the colours it took over from fell to 4.26:1 against
 * a card while passing against the page, which is the kind of thing that is
 * obvious in a table and invisible in a sentence.
 *
 * Non-text contrast is here for the same reason and is easier to get wrong,
 * because the number is lower and the element is small. WCAG 1.4.11 asks 3:1
 * of anything a reader needs in order to identify a control - which includes a
 * link's underline when the link's text is the same colour as the prose around
 * it, and that is exactly how this design sets a list of paper titles.
 */
const srgb = (hex: string): [number, number, number] =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];

const luminance = (hex: string): number => {
  const [r, g, b] = srgb(hex).map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};

/** WCAG 2.x relative contrast, rounded the way the guideline is quoted. */
export const contrast = (a: string, b: string): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((light! + 0.05) / (dark! + 0.05)) * 100) / 100;
};

const c = DESIGN.colors;

describe('contrast', () => {
  it('computes the canonical extremes', () => {
    expect(contrast('#000000', '#ffffff')).toBe(21);
    expect(contrast('#ffffff', '#ffffff')).toBe(1);
  });

  it('does not care which way round the pair is given', () => {
    expect(contrast(c.text!, c.bg!)).toBe(contrast(c.bg!, c.text!));
  });
});

/*
 * Every design, not only the one that happens to be the default.
 *
 * Three palettes ship in one build and a reader switches between them at
 * runtime, so a design nobody checked is a design somebody can be looking at.
 * The pairs are the same for all three because they are the same page: body on
 * the ground, muted on the ground and on a panel, a link in prose and on a
 * panel, and white out of the accent.
 *
 * Grounds a design does not declare are skipped rather than failed. Feature
 * has a `wash` that the other two have no use for, and Instrument a
 * `hairline`; asserting a token into existence because another design needed
 * one is how a palette grows fields nothing reads.
 */
describe.each(THEMES.map((theme) => [theme.name, theme.colors] as const))(
  '%s clears AA',
  (_name, colors) => {
    const BODY = 4.5;
    const grounds = ['bg', 'surface', 'wash'].filter((key) => key in colors);

    it.each(['text', 'muted', 'heading', 'accent'])('%s on every ground it can sit on', (fg) => {
      const failures = grounds
        .map((bg) => ({ bg, ratio: contrast(colors[fg]!, colors[bg]!) }))
        .filter(({ ratio }) => ratio < BODY);
      expect(failures).toEqual([]);
    });

    it('white out of the accent', () => {
      expect(contrast(colors.accentText!, colors.accent!)).toBeGreaterThanOrEqual(BODY);
    });
  },
);

describe('text clears AA', () => {
  const BODY = 4.5;
  it.each([
    ['body text on the page', 'text', 'bg'],
    ['muted text on the page', 'muted', 'bg'],
    ['muted text on a surface', 'muted', 'surface'],
    ['headings on the page', 'heading', 'bg'],
    ['a link in prose', 'accent', 'bg'],
    ['a link on a surface', 'accent', 'surface'],
    ['white out of the accent', 'accentText', 'accent'],
  ])('%s', (_what, fg, bg) => {
    expect(contrast(c[fg]!, c[bg]!)).toBeGreaterThanOrEqual(BODY);
  });
});

describe('non-text contrast clears AA', () => {
  const NON_TEXT = 3;

  /*
    The underline under a paper title. The title itself takes the heading
    colour, because colouring every entry of an all-link list says nothing, so
    the underline is the whole of what marks it as a link - and the hover that
    promotes it to the accent is the one state a phone never reaches.

    `border` is not this: at 1.71:1 it draws row dividers and card edges, which
    group content rather than identify a control, and it is deliberately quiet.
    Darkening that would weight the whole page to fix one underline.
  */
  it('marks a link in a list of links', () => {
    expect(contrast(c.linkRule!, c.bg!)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it('marks it on a surface too', () => {
    expect(contrast(c.linkRule!, c.surface!)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it('draws the focus ring', () => {
    expect(contrast(c.accent!, c.bg!)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it('keeps the quiet tokens quieter than the link rule', () => {
    // If these ever cross, the design has two rules doing one job.
    expect(contrast(c.border!, c.bg!)).toBeLessThan(contrast(c.linkRule!, c.bg!));
    expect(contrast(c.grid!, c.bg!)).toBeLessThan(contrast(c.border!, c.bg!));
  });
});

describe('every grey is neutral', () => {
  /*
    The claim Record's palette rests on: the accent is the only colour on the
    page, so it always means something. A grey with a cast is a second hue
    nobody declared.

    Record only, and deliberately. Feature's greys are warm because a neutral
    grey next to its warm ground reads as dirty, and Instrument's are cool for
    the same reason in the other direction - so this is one design's argument
    rather than a rule, and asserting it across all three would fail two
    designs for doing what they say they do.
  */
  const greys = Object.entries(c).filter(([name]) => name !== 'accent' && name !== 'accentText');

  it.each(greys)('%s', (_name, hex) => {
    const [r, g, b] = srgb(hex);
    expect(r).toBe(g);
    expect(g).toBe(b);
  });
});
