import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";
import type { Translator } from "@/lib/i18n/translate";

/**
 * @file date.ts
 * @description The date formatters used across the interface.
 *
 * The language is passed in: this module is called from both server and client
 * components, so it cannot read the cookie itself.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** The full date — "5 Ağustos 2026" / "5 August 2026". */
export function formatDate(isoDate: string, locale: Locale): string {
  return new Date(isoDate).toLocaleDateString(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Relative time, in the shape of "just now", "5 min ago", "3 h ago", "2 days
 * ago". Anything older than a week falls back to the full date.
 */
export function formatRelativeTime(isoDate: string, locale: Locale, t: Translator): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return "";

  const diff = Date.now() - then;

  // Swallow the small negative differences a server/client clock skew can produce
  if (diff < MINUTE) return t("time.justNow");
  if (diff < HOUR) return t("time.minutesAgo", { count: Math.floor(diff / MINUTE) });
  if (diff < DAY) return t("time.hoursAgo", { count: Math.floor(diff / HOUR) });
  if (diff < WEEK) return t("time.daysAgo", { count: Math.floor(diff / DAY) });

  return formatDate(isoDate, locale);
}
