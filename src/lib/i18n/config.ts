/**
 * @file config.ts
 * @description Dil desteğinin ortak sabitleri. Hem sunucu hem istemci tarafı
 * buradan okur.
 *
 * Yeni bir kütüphane eklenmedi: ihtiyacımız düz anahtar-değer sözlük ve bir
 * çerez. next-intl gibi bir bağımlılık bu kapsam için fazlalık olurdu.
 */

export const LOCALES = ["tr", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * Arayüzün ana dili. Çerez yoksa ve tarayıcı Türkçe istemiyorsa İngilizce'ye
 * düşülür (bkz. resolveLocale) — amaç Türkçe bilmeyen birinin uygulamayı
 * kullanabilmesi.
 */
export const DEFAULT_LOCALE: Locale = "tr";

/** Kullanıcının açık tercihi. httpOnly DEĞİL: istemci de okuyup yazabilmeli. */
export const LOCALE_COOKIE = "caskkeeper-locale";

/** Bir yıl — dil tercihi her ziyarette yeniden sorulmamalı. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Görüntülenecek dili belirler.
 *
 * Sıra: kullanıcının açık tercihi → tarayıcının dil başlığı → İngilizce.
 *
 * Son adım bilinçli: Accept-Language'ı Türkçe olmayan bir ziyaretçi (ör.
 * Almanca) anlamadığı bir arayüzle karşılaşmak yerine İngilizce görür.
 */
export function resolveLocale(cookieValue?: string | null, acceptLanguage?: string | null): Locale {
  if (isLocale(cookieValue)) return cookieValue;

  if (acceptLanguage) {
    // "tr-TR,tr;q=0.9,en;q=0.8" → ilk sıradaki dilin ana kodu
    const primary = acceptLanguage.split(",")[0]?.trim().split("-")[0]?.toLowerCase();
    if (primary === "tr") return "tr";
  }

  return "en";
}
