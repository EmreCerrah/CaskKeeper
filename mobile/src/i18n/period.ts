import type { TranslationKey } from "./dictionaries";

/**
 * @file period.ts
 * @description "YYYY-MM" dönemini okunur bir ay adına çevirir — SAF.
 *
 * Web tarafı bunu `Intl.DateTimeFormat` ile yapıyor. Mobilde ay adları sözlüğe
 * yazıldı: Hermes'in Intl desteği yapıya ve sürüme göre değişiyor ve eksik
 * olduğunda hata vermiyor, sessizce "2026-03" gibi ham bir metin bırakıyor.
 * Sözlükten okumak hem her cihazda aynı, hem test edilebilir.
 *
 * `translate` dışarıdan geçiliyor: bu dosya expo'ya bağımlı olmasın, testte
 * gerçek sözlükle çalışabilsin diye.
 */

const MONTH_KEYS: TranslationKey[] = [
  "month.1",
  "month.2",
  "month.3",
  "month.4",
  "month.5",
  "month.6",
  "month.7",
  "month.8",
  "month.9",
  "month.10",
  "month.11",
  "month.12",
];

/**
 * "2026-03" → "Mart 2026".
 *
 * Tanınmayan bir biçim gelirse metin olduğu gibi döner: grafiğin tamamını
 * çökertmek yerine o satırda ham dönemi göstermek yeterli.
 */
export function formatPeriod(period: string, translate: (key: TranslationKey) => string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;

  const monthKey = MONTH_KEYS[Number(match[2]) - 1];
  if (!monthKey) return period;

  return `${translate(monthKey)} ${match[1]}`;
}
