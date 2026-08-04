import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { createTranslator, getDictionary, type Translator } from "./translate";

/**
 * @file server.ts
 * @description Sunucu bileşenleri için dil çözümlemesi.
 *
 * cookies()/headers() kullandığı için bu modülü içe aktaran her sayfa dinamik
 * render edilir. Uygulamadaki sayfalar zaten `force-dynamic`; TEK İSTİSNA
 * /cevrimdisi — orası statik kalmalı, bu yüzden orada bu modül KULLANILMAZ,
 * dil istemci tarafında okunur.
 */

export function getLocale(): Locale {
  return resolveLocale(cookies().get(LOCALE_COOKIE)?.value, headers().get("accept-language"));
}

/** Sunucu bileşeninde metin üretmek için: `const t = getTranslations();` */
export function getTranslations(): Translator {
  return createTranslator(getDictionary(getLocale()));
}
