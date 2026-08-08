import { getLocales } from "expo-localization";
import { en, tr, type TranslationKey } from "./dictionaries";
import { resolveLocale, type Locale } from "./locale";

/**
 * @file i18n/index.ts
 * @description Cihaz diline göre metin üretir.
 * Kuralın kendisi locale.ts'te (saf, test edilebilir); burası cihazdan okuyor.
 */

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { tr, en };

export const deviceLocale: Locale = resolveLocale(getLocales().map((l) => l.languageCode));

/**
 * Metin üretir. `{ad}` yer tutucuları params ile değiştirilir.
 * Anahtar bulunamazsa anahtarın kendisi döner — ekranda boşluk yerine neyin
 * eksik olduğu görünsün diye.
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
