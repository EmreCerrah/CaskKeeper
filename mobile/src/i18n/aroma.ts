import type { TranslationKey } from "./dictionaries";

/**
 * @file aroma.ts
 * @description Maps an aroma category id to a translation key — PURE.
 *
 * The statistics endpoints send the category as both `category` (an id) and
 * `label` — but the label is generated in TURKISH ("Meyvemsi (Fruity)").
 * Showing that to someone running the app in English would leave a Turkish
 * name in the middle of the interface, so the app never uses the `label`
 * field.
 *
 * `t()` deliberately accepts only a `TranslationKey` (so a missing key is a
 * compile error), which means a concatenation like `"aroma." + category` will
 * not pass. Hence the mapping lives here, in one place and type-safe.
 */

const CATEGORY_KEYS: Record<string, TranslationKey> = {
  fruity: "aroma.fruity",
  floral: "aroma.floral",
  woody: "aroma.woody",
  sweet: "aroma.sweet",
  spicy: "aroma.spicy",
  smoky_peaty: "aroma.smoky_peaty",
  nutty: "aroma.nutty",
  cereal: "aroma.cereal",
  feinty_other: "aroma.feinty_other",
};

/**
 * An unknown id falls back to "Other".
 *
 * If a new category is added to the catalogue, the app shows it as "Other"
 * until the mobile release catches up — better than putting a raw id
 * ("smoky_peaty") on screen.
 */
export function aromaCategoryKey(category: string): TranslationKey {
  return CATEGORY_KEYS[category] ?? "aroma.feinty_other";
}
