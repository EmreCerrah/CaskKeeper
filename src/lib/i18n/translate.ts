import type { Locale } from "./config";
import { tr, type TranslationKey } from "./dictionaries/tr";
import { en } from "./dictionaries/en";

export type Dictionary = Record<TranslationKey, string>;
export type { TranslationKey };

const DICTIONARIES: Record<Locale, Dictionary> = { tr, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** The t() signature — identical on the server and the client. */
export type Translator = (key: TranslationKey, params?: Record<string, string | number>) => string;

/**
 * Produces text from the dictionary. `{name}` placeholders are replaced from
 * params.
 *
 * If a key is missing — the types should prevent it, but data can be corrupt at
 * runtime — the key itself is returned, so the screen shows what is missing
 * rather than a blank.
 */
export function createTranslator(dictionary: Dictionary): Translator {
  return (key, params) => {
    const template = dictionary[key] ?? key;
    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match
    );
  };
}
