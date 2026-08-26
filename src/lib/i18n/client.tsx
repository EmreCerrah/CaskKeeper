"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isLocale, type Locale } from "./config";
import { createTranslator, getDictionary, type Translator } from "./translate";

/**
 * @file client.tsx
 * @description The language context for client components.
 *
 * The dictionary is not serialised to the client: only the language code is
 * passed, and the dictionary itself is in the bundle. Today both languages
 * together come to a few kilobytes; if that grows, the dictionaries can be
 * split by area (nav, forms, …) and loaded per page.
 */

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** For producing text in a client component: `const t = useTranslations();` */
export function useTranslations(): Translator {
  const locale = useLocale();
  return useMemo(() => createTranslator(getDictionary(locale)), [locale]);
}

/**
 * Writes the language preference to the cookie.
 *
 * Not httpOnly, because both the server (on the first render) and the client
 * need to read it, and it holds nothing personal. After writing it,
 * router.refresh() has to be called so the server components re-render in the
 * new language — the calling component does that.
 */
export function persistLocale(locale: Locale): void {
  if (typeof document === "undefined" || !isLocale(locale)) return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
