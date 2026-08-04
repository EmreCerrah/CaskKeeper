import type { Locale } from "./config";
import { tr, type TranslationKey } from "./dictionaries/tr";
import { en } from "./dictionaries/en";

export type Dictionary = Record<TranslationKey, string>;
export type { TranslationKey };

const DICTIONARIES: Record<Locale, Dictionary> = { tr, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** t() imzası — sunucu ve istemci tarafında aynı. */
export type Translator = (key: TranslationKey, params?: Record<string, string | number>) => string;

/**
 * Sözlükten metin üretir. `{ad}` yer tutucuları params ile değiştirilir.
 *
 * Anahtar sözlükte yoksa (tipler bunu engellemeli, ama çalışma zamanında veri
 * bozulmuş olabilir) anahtarın kendisi döner: ekranda boşluk yerine ne eksik
 * olduğu görünür.
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
