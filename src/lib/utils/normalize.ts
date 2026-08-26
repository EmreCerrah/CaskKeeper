/**
 * @file normalize.ts
 * @description Slug generation and text normalisation helpers for the whisky
 * catalogue. Builds a unique, URL-safe slug from brand + expression +
 * distillery.
 */

const TR_CHAR_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
};

/**
 * Turns the given text into a URL-safe slug.
 * - Turkish and common European characters are mapped to their ASCII forms.
 * - Unicode accents (é, ñ, æ, …) are normalised away.
 * - Non-alphanumeric characters are dropped and spaces become hyphens.
 *
 * @example slugify("Glenfiddich 18's") → "glenfiddich-18s"
 * @example slugify("Köstritzer") → "kostritzer"
 */
export const slugify = (text: string): string => {
  if (!text || typeof text !== "string") return "";

  // 1) Turkish character mapping
  const trReplaced = text.replace(
    /[çğıöşüÇĞİÖŞÜ]/g,
    (match) => TR_CHAR_MAP[match] ?? match
  );

  // 2) Unicode normalisation (NFD splits the accents off, then non-ASCII is dropped)
  const normalized = trReplaced
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 3) Slug conversion
  return normalized
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")  // drop anything not alphanumeric
    .replace(/\s+/g, "-")           // spaces become hyphens
    .replace(/-{2,}/g, "-")         // collapse runs of hyphens into one
    .replace(/^-|-$/g, "");         // trim leading and trailing hyphens
};

/**
 * Builds a unique, normalised slug for the whisky catalogue.
 * Lookup order: distillery → brand → expression (name)
 *
 * Without a distillery it uses brand + name alone.
 * If every part is empty the slug falls back to "unknown-whiskey".
 *
 * @param brand       - The whisky's brand (required)
 * @param expression  - The expression / product name (required)
 * @param distillery  - The distillery (optional — include it when it differs from the brand)
 * @returns           - A URL-safe, unique slug
 *
 * @example
 * generateWhiskeySlug("Glenfiddich", "18 Year Old")
 * // → "glenfiddich-18-year-old"
 *
 * @example
 * generateWhiskeySlug("Glenfiddich", "18 Year Old", "William Grant & Sons")
 * // → "william-grant-sons-glenfiddich-18-year-old"
 */
export const generateWhiskeySlug = (
  brand: string,
  expression: string,
  distillery?: string
): string => {
  const parts = [distillery, brand, expression].filter(
    (p): p is string => typeof p === "string" && p.trim().length > 0
  );

  if (parts.length === 0) return "unknown-whiskey";

  return slugify(parts.join(" "));
};

/**
 * Turns user input into a safe RegExp fragment.
 * Stops characters typed into the search box — `.`, `*`, `(` — from being read
 * as regex, along with the surprising results and ReDoS risk that brings.
 */
export const escapeRegex = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Converts the given text to Title Case.
 * "single malt scotch" → "Single Malt Scotch"
 */
export const toTitleCase = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Maps a whisky type onto a normalised enum value.
 * Unknown types come back as "Other".
 */
const KNOWN_TYPES: Record<string, string> = {
  "single malt": "Single Malt",
  "single malt scotch": "Single Malt",
  "blended malt": "Blended Malt",
  "blended scotch": "Blended Scotch",
  blend: "Blended Scotch",
  blended: "Blended Scotch",
  "single grain": "Single Grain",
  bourbon: "Bourbon",
  "kentucky straight bourbon": "Bourbon",
  rye: "Rye",
  "american rye": "Rye",
  irish: "Irish",
  "irish whiskey": "Irish",
  japanese: "Japanese",
  "japanese whisky": "Japanese",
  "world whisky": "World Whisky",
};

export const normalizeWhiskeyType = (type?: string): string => {
  if (!type) return "Other";
  const key = type.toLowerCase().trim();
  return KNOWN_TYPES[key] ?? toTitleCase(type);
};
