import type { TranslationKey } from "./dictionaries";

/**
 * @file period.ts
 * @description Turns a "YYYY-MM" period into a readable month name — PURE.
 *
 * The web does this with `Intl.DateTimeFormat`. On mobile the month names went
 * into the dictionary instead: Hermes' Intl support varies by build and
 * version, and when it is missing it does not error — it quietly leaves raw
 * text like "2026-03". Reading from the dictionary is identical on every
 * device and testable.
 *
 * `translate` is passed in so this file does not depend on expo and can run
 * against the real dictionary in tests.
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
 * "2026-03" → "March 2026".
 *
 * An unrecognised format is returned unchanged: showing the raw period on that
 * one row beats bringing down the whole chart.
 */
export function formatPeriod(period: string, translate: (key: TranslationKey) => string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;

  const monthKey = MONTH_KEYS[Number(match[2]) - 1];
  if (!monthKey) return period;

  return `${translate(monthKey)} ${match[1]}`;
}
