import type { StringKey } from './i18n.ts';

/** Routes that come from collections rather than from the Pages collection. */
export interface NavItem {
  /**
   * Either a key into the interface catalogue, for the sections whose names
   * are the site's own words, or a literal label for the ones whose names come
   * out of the content - a Page's title is authored and translated by whoever
   * edits it, and does not belong in `src/lib/i18n.ts`.
   */
  labelKey?: StringKey;
  label?: string;
  href: string;
  order: number;
  /**
   * Off the site for now, and out of `NAV`. The entry stays so bringing the
   * section back is deleting one word rather than reconstructing a menu.
   */
  shelved?: true;
}

/**
 * The sections, in menu order.
 *
 * All of them are routed, in all three locales. In the client deployment this
 * came from, six of these were shelved: their content was placeholder, and a
 * menu item leading to a page of invented content is worse than a menu that is
 * short.
 *
 * This is a design demo, and that calculation inverts. Every page here is
 * invented and says so, and three designs cannot be compared on two page
 * shapes - a card grid, a dated list, a photo grid and a person's page are
 * each a different problem, and a design that handles a prose page well can
 * still fall over on a grid. Shipping the whole set is what makes the switcher
 * worth having.
 */
export const COLLECTION_NAV: NavItem[] = [
  { labelKey: 'navPublications', href: '/publications', order: 3 },
  // Directly under Publications, and named rather than folded into a GitHub
  // link in a footer. Across the lab sites we looked at, code and data are
  // either absent from the menu or buried inside a project page; putting them
  // at the top level is the fastest thing that separates a research group's
  // site from a departmental template, and it is a claim about how the lab
  // works rather than a decoration.
  { labelKey: 'navSoftware', href: '/software', order: 4 },
  { labelKey: 'navTeam', href: '/team', order: 5 },
  { labelKey: 'navProjects', href: '/projects', order: 6 },
  { labelKey: 'navNews', href: '/news', order: 7 },
  { labelKey: 'navEvents', href: '/events', order: 8 },
  { labelKey: 'navGallery', href: '/gallery', order: 9 },
];

/**
 * Pages-collection entries the site compiles but does not publish.
 *
 * Empty here, and kept because the mechanism is the point: a Page is Markdown
 * rendered by `[slug].astro`, so it cannot be hidden by the underscore trick a
 * route file uses. Naming one here keeps it in the collection and in the CMS,
 * where its text can be written before the page goes live.
 */
export const SHELVED_PAGES: string[] = [];

/** The menu, with any shelved section taken out. */
export const NAV = COLLECTION_NAV.filter((item) => !item.shelved);

// /how-this-works is deliberately absent: it is a manual for whoever edits the
// site, not something visitors should find in the menu. The page still builds
// and is reachable by URL.

export { url, isCurrent } from './paths.ts';
