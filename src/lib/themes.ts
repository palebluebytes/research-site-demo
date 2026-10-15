/**
 * The three design directions, and the switcher's own data.
 *
 * Each is a `DesignSpec` - fonts, colours, a type and space scale, a few shape
 * values - plus the prose that says what it argues and what it costs. Each also
 * has its arrangement in a stylesheet of its own: Record's is
 * `src/styles/design.css`, Feature's `src/styles/themes/b.css`, Instrument's
 * `src/styles/themes/c.css`.
 *
 * **What all three share is the content, the routes, the markup and the three
 * locales.** That is the whole point of a runtime switcher: the reader is
 * comparing designs, not three different sites, so anything that differs
 * between them is a design decision rather than a difference in what there was
 * to design. A switcher that also changed the copy would prove nothing.
 *
 * Record is not restated here. Its spec is `DESIGN` in `src/lib/design.ts`,
 * which is where it has always been edited and where its tests read it from;
 * a second copy for the sake of a uniform list is a copy that goes stale.
 */
import { DESIGN, type DesignSpec } from './design.ts';

export interface ThemeSpec extends DesignSpec {
  id: string;
  name: string;
  /** One word, for a switcher on a screen too narrow for the full name. */
  shortName: string;
  /** One line in the switcher, saying what the direction is for. */
  description: string;
  /** What the design argues. */
  thesis: string;
  /** What a reader concludes about whoever runs the site. */
  saysAboutYou: string;
  /**
   * What is given up by choosing it. This is the field that earns the page:
   * three sales pitches help nobody choose between three designs.
   */
  cost: string;
  /** Where it comes from, so the direction can be looked at rather than imagined. */
  precedent: string;
}

/*
 * Fraunces over Instrument Sans, for the design that sets a headline against a
 * body face. Fraunces is loaded from its optical-size build, so one file
 * covers a cover line and a caption and each is drawn for the size it is set
 * at - `font-optical-sizing: auto` does that on its own.
 *
 * The fallbacks matter more here than in a one-family design: a display serif
 * that falls back to a sans changes the page's whole argument, so the chain
 * stays serif the whole way down.
 */
const DISPLAY_SERIF =
  "'Fraunces Variable', 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
const EDITORIAL_SANS =
  "'Instrument Sans Variable', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";

/*
 * IBM Plex Sans with Source Code Pro, for the design where monospace is not a
 * code style but the voice its metadata is written in. The mono partner comes
 * from a different family because Plex Mono has no variable cut, which is a
 * mismatch worth knowing about: Source Code Pro is a little narrower and a
 * little larger on the body, so the two are set at the same step and left
 * alone rather than optically corrected.
 *
 * The mono fallback keeps the system monospace stack behind it, because a
 * metadata rail that falls back to a proportional face stops being a rail.
 */
const PLEX_SANS =
  "'IBM Plex Sans Variable', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const SOURCE_MONO = `'Source Code Pro Variable', ${MONO}`;

const RECORD: ThemeSpec = {
  ...DESIGN,
  id: 'a',
  name: 'Record',
  shortName: 'Record',
  description: 'Achromatic, gridded, one grotesque. The design stands behind the work.',
  thesis:
    'The site is a record of the work, not an argument for it. One grotesque, a grid you can see, and colour used only where it carries information.',
  saysAboutYou:
    'That the science is the point and the reader’s time matters more than the group’s personality. It reads as an institution rather than as a person.',
  cost:
    'Warmth, and memorability. Nothing here is recognisably yours: a visitor remembers the papers and not the page, and this is not a design anyone shares for its own sake. It is also the safe answer, so it has to be executed exactly right or it reads as a template.',
  precedent:
    'Research-institute group pages; Müller-Brockmann’s grid systems, where rules and alignment do the work that decoration does elsewhere.',
};

const FEATURE: ThemeSpec = {
  id: 'b',
  name: 'Feature',
  shortName: 'Feature',
  description: 'A display serif over an editorial sans, on a warm ground. The science gets told, not listed.',
  fonts: { display: DISPLAY_SERIF, body: EDITORIAL_SANS },
  /*
   * The widest scale of the three. A magazine's argument is made by the
   * distance between a cover line and the body text under it, so the large end
   * runs much further while step-0 stays at a comfortable reading size: about
   * six times the body, against Record's three.
   */
  type: { minBase: 17, maxBase: 19, minRatio: 1.2, maxRatio: 1.42 },
  /* Margins are the other half of it: the most generous space base here. */
  space: { minBase: 16, maxBase: 30 },
  /*
   * Warm off-white rather than white, and a deep carmine for the one hue.
   *
   * Two tints, not one: `surface` is the quiet panel, `wash` the stronger tone
   * that mounts a figure and backs an annotation. Both are warm, because a
   * neutral grey next to this ground reads as dirty - which is the opposite of
   * Record's rule, and the clearest single difference between the two
   * palettes.
   *
   * The accent clears 4.5:1 on all three grounds and under white, which is
   * why it is this dark: an editorial red bright enough to feel like a kicker
   * fails against the wash it has to sit on.
   */
  colors: {
    bg: '#faf7f2',
    surface: '#f2ebe1',
    wash: '#e9ddcd',
    text: '#38322c',
    muted: '#6a6056',
    heading: '#1d1813',
    accent: '#8c2f39',
    accentText: '#ffffff',
    border: '#c9bca9',
  },
  /*
   * Square, like print. Rounding is the one shape choice all three designs
   * agree on, and inventing a radius here to look different from Record would
   * be a difference nobody asked for: this design separates itself by type,
   * colour and column, not by corners.
   */
  shape: {
    radius: '0',
    rule: '1px',
    ruleStrong: '2px',
    ruleHeavy: '3px',
    measure: '64ch',
    measureWide: '70ch',
    pageMax: '82rem',
  },
  thesis:
    'The site tells the science rather than listing it. A question in display type carries the page, a figure carries the evidence, and every image says where it came from.',
  saysAboutYou:
    'That you can explain what you work on to someone who does not already know, and that you think that is worth the space. It reads as a person with an argument rather than as a department.',
  cost:
    'Editing time, forever. A question has to be written and rewritten as the work moves, figures have to be chosen and captioned, and a stale feature looks worse than a stale list. It is also the least neutral of the three: a design with a voice can be disagreed with, and it dates faster than a record does.',
  precedent:
    'Long-form science magazines; the front of a journal issue, where the contents page ranks the work and the figure is the argument.',
};

const INSTRUMENT: ThemeSpec = {
  id: 'c',
  name: 'Instrument',
  shortName: 'Instrument',
  description: 'Monospaced identifiers against a humanist sans, on a labelled panel. The site is something the group keeps.',
  fonts: { display: PLEX_SANS, body: PLEX_SANS, mono: SOURCE_MONO },
  /*
   * The narrowest scale of the three, deliberately. Hierarchy here comes from
   * weight, case, colour and rules; a page title is about twice the body
   * rather than Record's four times or Feature's six, so nothing on the page
   * shouts and the data is the largest thing on it.
   */
  type: { minBase: 16.5, maxBase: 17.5, minRatio: 1.14, maxRatio: 1.19 },
  /* And the tightest spacing. Compression is the point: this is a panel. */
  space: { minBase: 14, maxBase: 16 },
  /*
   * Cool near-monochrome, and one accent lifted out of viridis - the colormap
   * this kind of work plots its data in. That is the colour idea: the one hue
   * on the page is a hue the reader has already seen on a figure, so it
   * belongs to the work rather than being picked to look like something.
   *
   * `#365c8d` is the third stop of eight-class viridis, and it is the darkest
   * stop that is still recognisably the colormap: the teal and green stops
   * further along the ramp do not clear 4.5:1 as link text.
   *
   * Three rule colours at one width, because the rules do all the dividing
   * here and a single weight flattens every list into every other one:
   * `heading` opens a block, `border` closes a heading, `hairline` separates
   * the rows inside. A page of uniformly pale rules reads as unfinished
   * rather than as restrained, which is the trap this design walks into if
   * every line on it is the same grey.
   */
  colors: {
    bg: '#f6f7f9',
    surface: '#eceef1',
    text: '#1b2024',
    muted: '#576068',
    heading: '#0b0f12',
    accent: '#365c8d',
    accentText: '#ffffff',
    border: '#98a2ab',
    hairline: '#ccd3d9',
  },
  /*
   * Nothing is rounded and the rules are hairlines. The measure is the widest
   * of the three because this design's content column is the narrowest: the
   * page is held narrower and the rail takes a fixed band of it, so a wide
   * measure fills the column instead of leaving empty width the section rules
   * point into.
   */
  shape: {
    radius: '0',
    rule: '1px',
    ruleStrong: '1px',
    ruleHeavy: '1px',
    measure: '70ch',
    measureWide: '74ch',
    pageMax: '74rem',
  },
  thesis:
    'The site is an instrument the group keeps, not a brochure about it. Monospace carries every identifier, hairline rules do all the dividing, and software and data sit in the menu beside publications.',
  saysAboutYou:
    'That the work is reproducible and that you expect to be checked. It reads as a working group with an output rather than as a person with a profile.',
  cost:
    'Warmth, and the widest audience. Nothing on the page is large, so nothing reaches a visitor who is not already looking for you, and the machinery it puts on show - identifiers, an ORCID iD, a file path - means nothing to a reader outside research and reads as cold to one inside it. The identity panel is also repeated at full height on every page, which is a lot of chrome above the content on a phone.',
  precedent:
    'Public genomic-surveillance build pages; Tufte on data-ink, where the ornament is removed until only the measurement is left.',
};

/** In the order the switcher lists them, and the order they were made. */
export const THEMES: ThemeSpec[] = [RECORD, FEATURE, INSTRUMENT];

/** The one a reader gets with no attribute set, and with no stored choice. */
export const DEFAULT_THEME = RECORD.id;

export const themeById = (id: string): ThemeSpec | undefined =>
  THEMES.find((theme) => theme.id === id);
