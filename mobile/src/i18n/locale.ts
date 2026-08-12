/**
 * @file locale.ts
 * @description The PURE part of resolving the language.
 *
 * Kept apart from expo-localization: that module only runs on a device and
 * queries it on import, so it cannot be loaded in a unit test. The rule lives
 * here; reading from the device lives in index.ts.
 */

export type Locale = "tr" | "en";

/**
 * Picks the app language from the device's preferred languages.
 *
 * The same rule as the web: Turkish if Turkish is asked for, ENGLISH
 * otherwise. That last step is deliberate — somebody who does not read Turkish
 * should not meet an interface they cannot use (see resolveLocale on the web).
 */
export function resolveLocale(languageCodes: (string | null | undefined)[]): Locale {
  const primary = languageCodes[0]?.toLowerCase().split("-")[0];
  return primary === "tr" ? "tr" : "en";
}

/**
 * The value of the `Accept-Language` header.
 *
 * The server produces error messages in the language of the request (PR #24),
 * so sending this header removes any need to translate error text on the
 * client.
 */
export function acceptLanguageHeader(locale: Locale): string {
  return locale === "tr" ? "tr-TR,tr;q=0.9,en;q=0.8" : "en-GB,en;q=0.9";
}
