/**
 * @file config.ts
 * @description The shared constants behind language support. Both the server
 * and the client read them from here.
 *
 * No library was added: what is needed is a flat key-value dictionary and a
 * cookie. A dependency like next-intl would be overkill at this scope.
 */

export const LOCALES = ["tr", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * The interface's primary language. With no cookie and a browser that does not
 * ask for Turkish, it falls back to English (see resolveLocale) — the point
 * being that somebody who does not read Turkish can still use the app.
 */
export const DEFAULT_LOCALE: Locale = "tr";

/** The user's explicit choice. NOT httpOnly: the client has to read and write it too. */
export const LOCALE_COOKIE = "caskkeeper-locale";

/** One year — nobody should be asked their language on every visit. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The tag handed to the Intl API. Date and number formatting has to move with
 * the interface language — seeing "5 Ağustos 2026" on an English screen is
 * precisely the leak translation exists to close.
 *
 * en-GB for English: the interface text uses British spelling too (favourite,
 * flavour), and day-month-year keeps the same order as Turkish.
 */
export const INTL_LOCALE: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-GB",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Decides which language to display.
 *
 * The order: the user's explicit choice → the browser's language header →
 * English.
 *
 * That last step is deliberate: a visitor whose Accept-Language is not Turkish
 * — German, say — gets English rather than an interface they cannot read.
 */
export function resolveLocale(cookieValue?: string | null, acceptLanguage?: string | null): Locale {
  if (isLocale(cookieValue)) return cookieValue;

  if (acceptLanguage) {
    // "tr-TR,tr;q=0.9,en;q=0.8" → the primary code of the first language listed
    const primary = acceptLanguage.split(",")[0]?.trim().split("-")[0]?.toLowerCase();
    if (primary === "tr") return "tr";
  }

  return "en";
}
