// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `base` lets the same build serve from a GitHub Pages project path
// (/research-site-demo) or from a domain root. Defaults to root for local dev.
const base = process.env.SITE_BASE ?? '/';
const site = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  base,
  // robots.txt points at the sitemap whenever a build is indexable; without
  // this that reference would be a 404.
  integrations: [
    sitemap({
      /*
       * The locales, so each entry carries an `xhtml:link` to its
       * translations. This is the same claim the `hreflang` tags in the
       * document head make, and a crawler reads whichever it finds first -
       * saying it twice costs nothing and the sitemap is the one a crawler is
       * guaranteed to fetch.
       */
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-GB', fr: 'fr-FR', es: 'es-ES' },
      },
      /*
       * /how-this-works is the editor's manual: `noindex` in the document, out
       * of the menu, and written for one reader. A `noindex` page listed in the
       * sitemap is the site asking to have it indexed and then refusing, which
       * is a contradiction a crawler reports rather than resolves.
       */
      filter: (page) => !page.includes('/how-this-works'),
    }),
  ],
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
