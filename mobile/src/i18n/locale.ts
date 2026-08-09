/**
 * @file locale.ts
 * @description Dil çözümlemesinin SAF kısmı.
 *
 * expo-localization'dan ayrı tutuluyor: o modül yalnızca cihazda çalışıyor ve
 * yüklenirken cihaza soruyor, dolayısıyla birim testte kurulamaz. Kural burada,
 * cihazdan okuma index.ts'te.
 */

export type Locale = "tr" | "en";

/**
 * Cihazın tercih ettiği dillerden uygulama dilini seçer.
 *
 * Kural web ile aynı: Türkçe isteniyorsa Türkçe, aksi halde İNGİLİZCE.
 * Son adım bilinçli — Türkçe bilmeyen biri anlamadığı bir arayüzle
 * karşılaşmasın (bkz. web'deki resolveLocale).
 */
export function resolveLocale(languageCodes: (string | null | undefined)[]): Locale {
  const primary = languageCodes[0]?.toLowerCase().split("-")[0];
  return primary === "tr" ? "tr" : "en";
}

/**
 * `Accept-Language` başlığının değeri.
 *
 * Sunucu hata mesajlarını isteğin diline göre üretiyor (PR #24), yani bu
 * başlığı göndermek hata metinlerini istemcide çevirme derdinden kurtarıyor.
 */
export function acceptLanguageHeader(locale: Locale): string {
  return locale === "tr" ? "tr-TR,tr;q=0.9,en;q=0.8" : "en-GB,en;q=0.9";
}
