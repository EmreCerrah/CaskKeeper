import { getLocales } from "expo-localization";
import { en, tr, type TranslationKey } from "./dictionaries";
import { resolveLocale, type Locale } from "./locale";

/**
 * @file i18n/index.ts
 * @description Produces text in the device's language.
 * The rule itself lives in locale.ts (pure, testable); this file reads the
 * device.
 */

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { tr, en };

export const deviceLocale: Locale = resolveLocale(getLocales().map((l) => l.languageCode));

/**
 * Produces text. `{name}` placeholders are replaced from params.
 * An unknown key returns the key itself — so the screen shows what is missing
 * rather than a blank.
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const template = DICTIONARIES[deviceLocale][key] ?? key;
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

export { acceptLanguageHeader } from "./locale";
export type { Locale, TranslationKey };
