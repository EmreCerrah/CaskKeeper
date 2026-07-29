/**
 * @file date.ts
 * @description Arayüzde kullanılan Türkçe tarih biçimlendiricileri.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * "az önce", "5 dk önce", "3 sa önce", "2 gün önce" biçiminde göreli zaman.
 * Bir haftadan eskiyse tam tarihe düşer.
 */
export function formatRelativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return "";

  const diff = Date.now() - then;

  // Sunucu/istemci saat farkından doğabilecek küçük negatif farkları yut
  if (diff < MINUTE) return "az önce";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} dk önce`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} sa önce`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)} gün önce`;

  return new Date(isoDate).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
