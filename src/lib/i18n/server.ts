import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { createTranslator, getDictionary, type Translator } from "./translate";

/**
 * @file server.ts
 * @description Resolving the language for server components.
 *
 * It uses cookies()/headers(), so every page importing this module is rendered
 * dynamically. The app's pages are `force-dynamic` anyway; the ONE EXCEPTION is
 * /offline — that has to stay static, so this module is NOT used there and the
 * language is read on the client instead.
 */

export function getLocale(): Locale {
  return resolveLocale(cookies().get(LOCALE_COOKIE)?.value, headers().get("accept-language"));
}

/** For producing text in a server component: `const t = getTranslations();` */
export function getTranslations(): Translator {
  return createTranslator(getDictionary(getLocale()));
}
