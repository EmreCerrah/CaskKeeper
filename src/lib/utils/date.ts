import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import type { Translator } from "@/lib/i18n/translate";

/**
 * @file date.ts
 * @description Arayüzde kullanılan tarih biçimlendiricileri.
 *
 * Dil dışarıdan verilir: bu modül hem sunucu hem istemci bileşenlerinden
 * çağrılıyor, dolayısıyla kendisi çerezi okuyamaz.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** Tam tarih — "5 Ağustos 2026" / "5 August 2026". */
export function formatDate(isoDate: string, locale: Locale): string {
  return new Date(isoDate).toLocaleDateString(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * "az önce", "5 dk önce", "3 sa önce", "2 gün önce" biçiminde göreli zaman.
 * Bir haftadan eskiyse tam tarihe düşer.
 */
export function formatRelativeTime(isoDate: string, locale: Locale, t: Translator): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return "";

  const diff = Date.now() - then;

  // Sunucu/istemci saat farkından doğabilecek küçük negatif farkları yut
  if (diff < MINUTE) return t("time.justNow");
  if (diff < HOUR) return t("time.minutesAgo", { count: Math.floor(diff / MINUTE) });
  if (diff < DAY) return t("time.hoursAgo", { count: Math.floor(diff / HOUR) });
  if (diff < WEEK) return t("time.daysAgo", { count: Math.floor(diff / DAY) });

  return formatDate(isoDate, locale);
}
