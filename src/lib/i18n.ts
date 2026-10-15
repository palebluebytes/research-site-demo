/**
 * The site's interface language, described once.
 *
 * Two things are kept apart here on purpose. **Content** is authored per
 * locale and lives in the content collections, where the schema decides which
 * fields a translation needs - see `title_fr` in `src/schema/collections.ts`,
 * which the CMS form and the build validator both derive from one declaration,
 * so a translated field cannot exist in the form and be missing from the
 * schema. **Interface strings** are the site's own words - the skip link, a
 * section heading, the name of a menu - and they live below, because no editor
 * should have to fill in "Skip to content" before the site will build.
 *
 * Placeholders are named rather than positional (`{n}`, not `%s`). Positional
 * placeholders cannot be reordered by a translator, and two of them in one
 * string is a bug waiting for a language whose clause order differs from
 * English's. `interpolate` is the whole implementation.
 *
 * `test/i18n.test.ts` is the gate: every key defined for the default locale
 * must exist, and be non-empty, in every other locale. A missing translation
 * is a failing test rather than an English word on a French page.
 */

export const LOCALES = ['en', 'fr', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

/**
 * Each language named in itself. A switcher that says "French" to a French
 * reader is written for the reader who does not need it.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
};

/** The BCP 47 tag used for `Intl` and for `lang`/`hreflang`. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  es: 'es-ES',
};

const en = {
  skipToContent: 'Skip to content',
  navPrimaryLabel: 'Primary',
  languageNavLabel: 'Language',
  onThisPage: 'On this page',

  navPublications: 'Publications',
  navSoftware: 'Software & data',
  navTeam: 'Team',
  navProjects: 'Projects',
  navNews: 'News',
  navEvents: 'Events',
  navGallery: 'Gallery',

  publicationsTitle: 'Publications',
  publicationsDescription: 'Publications, synchronised from ORCID.',
  selectedPublications: 'Selected publications',
  otherPublications: 'Other publications',
  allPublications: 'All publications',
  preprint: 'Preprint',
  etAl: 'et al.',

  designPreviewLabel: 'Design preview',
  previewDesign: 'Preview design',
  theThreeDesigns: 'The three designs',

  softwareDescription: 'Research code and data released by the group.',
  softwareLede: 'Code and data behind the papers, released so the analysis can be read and re-run rather than taken on trust.',

  galleryDescription: 'Photographs from the group.',
  galleryUnavailable: 'Gallery unavailable.',

  newsDescription: 'Announcements and updates from the group.',

  projectsDescription: 'Research projects running in the group.',
  fundedBy: 'Funded by {funder}',

  teamDescription: 'People in the {lab}.',
  positions: 'Positions',
  demoContent: 'Demo content.',
  teamPlaceholderNote: 'Every entry here is a placeholder, shown so the team layout can be judged at realistic size. None of them are real people.',
  formerMembers_one: '{n} former member',
  formerMembers_other: '{n} former members',
  placeholderEntry: 'Placeholder entry.',
  notARealPerson: 'This is not a real person.',
  personInLab: '{name}, {rank} in the {lab}.',
  websiteLabel: 'Website',

  eventsDescription: 'Seminars, group meetings and other dates.',
  upcoming: 'Upcoming',
  past: 'Past',
  nothingScheduled: 'Nothing scheduled.',
  untitledEvent: 'Untitled event',

  lastUpdatedFrom: 'Last updated from',
  lastUpdatedOn: 'on',

  siteSummary: '{name}, {jobTitle} at {institution}.',

  missingHighlightsLead_one: '{n} highlighted DOI is not on the ORCID record',
  missingHighlightsRest_one: '({dois}), so it cannot be shown. Adding it to ORCID will fix this.',
  missingHighlightsLead_other: '{n} highlighted DOIs are not on the ORCID record',
  missingHighlightsRest_other: '({dois}), so they cannot be shown. Adding them to ORCID will fix this.',
} as const;

export type StringKey = keyof typeof en;

/**
 * French. Translated as interface copy rather than word-for-word: the menu
 * entries are what a French research group calls those sections, and
 * `lastUpdatedOn` is "le" because the date follows it directly.
 */
const fr: Record<StringKey, string> = {
  skipToContent: 'Aller au contenu',
  navPrimaryLabel: 'Principal',
  languageNavLabel: 'Langue',
  onThisPage: 'Sur cette page',

  navPublications: 'Publications',
  navSoftware: 'Logiciels et données',
  navTeam: 'Équipe',
  navProjects: 'Projets',
  navNews: 'Actualités',
  navEvents: 'Événements',
  navGallery: 'Galerie',

  publicationsTitle: 'Publications',
  publicationsDescription: 'Publications, synchronisées depuis ORCID.',
  selectedPublications: 'Publications sélectionnées',
  otherPublications: 'Autres publications',
  allPublications: 'Toutes les publications',
  preprint: 'Prépublication',
  etAl: 'et al.',
  designPreviewLabel: 'Aperçu du design',
  previewDesign: 'Aperçu du design',
  theThreeDesigns: 'Les trois designs',

  softwareDescription: 'Code et données de recherche publiés par le groupe.',
  softwareLede: 'Le code et les données derrière les articles, publiés pour que l’analyse puisse être lue et rejouée plutôt que crue sur parole.',

  galleryDescription: 'Photographies du groupe.',
  galleryUnavailable: 'Galerie indisponible.',

  newsDescription: 'Annonces et actualités du groupe.',

  projectsDescription: 'Projets de recherche en cours dans le groupe.',
  fundedBy: 'Financé par {funder}',

  teamDescription: 'Les membres du {lab}.',
  positions: 'Postes',
  demoContent: 'Contenu de démonstration.',
  teamPlaceholderNote: 'Chaque entrée est un espace réservé, affiché pour que la mise en page de l’équipe puisse être jugée à taille réelle. Aucune ne correspond à une personne réelle.',
  formerMembers_one: '{n} ancien membre',
  formerMembers_other: '{n} anciens membres',
  placeholderEntry: 'Entrée fictive.',
  notARealPerson: 'Il ne s’agit pas d’une personne réelle.',
  personInLab: '{name}, {rank} au {lab}.',
  websiteLabel: 'Site web',

  eventsDescription: 'Séminaires, réunions de groupe et autres dates.',
  upcoming: 'À venir',
  past: 'Passés',
  nothingScheduled: 'Rien de prévu.',
  untitledEvent: 'Événement sans titre',

  lastUpdatedFrom: 'Dernière mise à jour depuis',
  lastUpdatedOn: 'le',

  siteSummary: '{name}, {jobTitle} à {institution}.',

  missingHighlightsLead_one: '{n} DOI sélectionné est absent du dossier ORCID',
  missingHighlightsRest_one:
    '({dois}), il ne peut donc pas être affiché. L’ajouter à ORCID corrigera ce problème.',
  missingHighlightsLead_other: '{n} DOI sélectionnés sont absents du dossier ORCID',
  missingHighlightsRest_other:
    '({dois}), ils ne peuvent donc pas être affichés. Les ajouter à ORCID corrigera ce problème.',
};

/**
 * Spanish. `lastUpdatedOn` is "el" for the same reason the French one is "le":
 * the date follows the word directly, and a translation that returned "en"
 * would read as a place rather than a time.
 */
const es: Record<StringKey, string> = {
  skipToContent: 'Saltar al contenido',
  navPrimaryLabel: 'Principal',
  languageNavLabel: 'Idioma',
  onThisPage: 'En esta página',

  navPublications: 'Publicaciones',
  navSoftware: 'Software y datos',
  navTeam: 'Equipo',
  navProjects: 'Proyectos',
  navNews: 'Noticias',
  navEvents: 'Eventos',
  navGallery: 'Galería',

  publicationsTitle: 'Publicaciones',
  publicationsDescription: 'Publicaciones, sincronizadas desde ORCID.',
  selectedPublications: 'Publicaciones seleccionadas',
  otherPublications: 'Otras publicaciones',
  allPublications: 'Todas las publicaciones',
  preprint: 'Prepublicación',
  etAl: 'et al.',
  designPreviewLabel: 'Vista previa del diseño',
  previewDesign: 'Vista previa del diseño',
  theThreeDesigns: 'Los tres diseños',

  softwareDescription: 'Código y datos de investigación publicados por el grupo.',
  softwareLede: 'El código y los datos detrás de los artículos, publicados para que el análisis pueda leerse y repetirse en lugar de aceptarse sin más.',

  galleryDescription: 'Fotografías del grupo.',
  galleryUnavailable: 'Galería no disponible.',

  newsDescription: 'Anuncios y novedades del grupo.',

  projectsDescription: 'Proyectos de investigación en curso en el grupo.',
  fundedBy: 'Financiado por {funder}',

  teamDescription: 'Personas del {lab}.',
  positions: 'Puestos',
  demoContent: 'Contenido de demostración.',
  teamPlaceholderNote: 'Cada entrada es un marcador de posición, mostrada para poder juzgar la maquetación del equipo a tamaño real. Ninguna corresponde a una persona real.',
  formerMembers_one: '{n} antiguo miembro',
  formerMembers_other: '{n} antiguos miembros',
  placeholderEntry: 'Entrada ficticia.',
  notARealPerson: 'No es una persona real.',
  personInLab: '{name}, {rank} en el {lab}.',
  websiteLabel: 'Sitio web',

  eventsDescription: 'Seminarios, reuniones del grupo y otras fechas.',
  upcoming: 'Próximos',
  past: 'Pasados',
  nothingScheduled: 'Nada programado.',
  untitledEvent: 'Evento sin título',

  lastUpdatedFrom: 'Última actualización desde',
  lastUpdatedOn: 'el',

  siteSummary: '{name}, {jobTitle} en {institution}.',

  missingHighlightsLead_one: '{n} DOI seleccionado no está en el registro ORCID',
  missingHighlightsRest_one:
    '({dois}), por lo que no puede mostrarse. Añadirlo a ORCID solucionará esto.',
  missingHighlightsLead_other: '{n} DOI seleccionados no están en el registro ORCID',
  missingHighlightsRest_other:
    '({dois}), por lo que no pueden mostrarse. Añadirlos a ORCID solucionará esto.',
};

export const STRINGS: Record<Locale, Record<StringKey, string>> = { en, fr, es };

/** Replace every `{name}` for which a value was given. */
export function interpolate(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}

/**
 * A lookup bound to one locale.
 *
 * Returns the default locale's string when a key is missing rather than
 * throwing, because a page that renders one English word is better than a page
 * that does not render - and the missing key is already a failing test.
 */
export function t(locale: Locale) {
  return (key: StringKey, values?: Record<string, string | number>): string =>
    interpolate(STRINGS[locale][key] ?? STRINGS[DEFAULT_LOCALE][key] ?? key, values);
}

/**
 * Pick the `_one`/`_other` variant. English, French and Spanish all put the
 * boundary between one and many in the same place, so one rule serves all
 * three; a locale with a dual or a zero form - Arabic, Polish, Welsh - would
 * need its own, and this function is where that would go rather than at each
 * call site.
 */
export const plural = (n: number): '_one' | '_other' => (n === 1 ? '_one' : '_other');

/**
 * The path prefix a locale's pages live under.
 *
 * The default locale has none: the site's main audience should not have to
 * carry a language code around, and `hreflang` plus `x-default` is how a
 * crawler is told that the unprefixed URLs are the English ones.
 */
export const localePrefix = (locale: Locale): string =>
  locale === DEFAULT_LOCALE ? '' : `/${locale}`;

/** A site-root path, moved into one locale. `/research` -> `/fr/research`. */
export function localePath(locale: Locale, path: string): string {
  const prefix = localePrefix(locale);
  if (!prefix) return path;
  return path === '/' ? prefix : `${prefix}${path}`;
}

/** Every locale's version of one page, for `hreflang`. */
export const alternatesFor = (path: string): { locale: Locale; path: string }[] =>
  LOCALES.map((locale) => ({ locale, path: localePath(locale, path) }));

/** A date in the reader's language. */
export const formatDate = (
  locale: Locale,
  date: Date,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string => new Intl.DateTimeFormat(LOCALE_TAGS[locale], { ...options, timeZone: 'UTC' }).format(date);
