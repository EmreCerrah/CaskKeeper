"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isLocale, type Locale } from "./config";
import { createTranslator, getDictionary, type Translator } from "./translate";

/**
 * @file client.tsx
 * @description İstemci bileşenleri için dil bağlamı.
 *
 * Sözlük istemciye serileştirilmez: yalnızca dil kodu geçirilir, sözlüğün
 * kendisi paketin içindedir. Bugün iki dilin toplam metni birkaç kilobayt;
 * büyürse sözlükler alan bazında (nav, forms, …) bölünüp sayfa başına
 * yüklenebilir.
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

/** İstemci bileşeninde metin üretmek için: `const t = useTranslations();` */
export function useTranslations(): Translator {
  const locale = useLocale();
  return useMemo(() => createTranslator(getDictionary(locale)), [locale]);
}

/**
 * Dil tercihini çereze yazar.
 *
 * httpOnly değil, çünkü hem sunucunun (ilk render) hem istemcinin okuması
 * gerekiyor; içinde kişisel bir bilgi yok. Yazdıktan sonra sunucu
 * bileşenlerinin yeni dille yeniden render edilmesi için router.refresh()
 * çağrılmalı — bunu çağıran bileşen yapar.
 */
export function persistLocale(locale: Locale): void {
  if (typeof document === "undefined" || !isLocale(locale)) return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
