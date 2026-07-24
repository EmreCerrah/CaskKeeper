/**
 * @file normalize.ts
 * @description Whiskey catalog için slug üretimi ve metin normalizasyon yardımcıları.
 * Brand + Expression + Distillery üçlüsünden benzersiz, URL-safe slug oluşturur.
 */

const TR_CHAR_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
};

/**
 * Verilen metni URL-safe slug formatına dönüştürür.
 * - Türkçe ve yaygın Avrupa karakterleri ASCII karşılığına çevrilir.
 * - Unicode aksan karakterleri (é, ñ, æ, vs.) normalize edilir.
 * - Alfanumerik olmayan karakterler kaldırılır, boşluklar tire yapılır.
 *
 * @example slugify("Glenfiddich 18's") → "glenfiddich-18s"
 * @example slugify("Köstritzer") → "kostritzer"
 */
export const slugify = (text: string): string => {
  if (!text || typeof text !== "string") return "";

  // 1) Türkçe karakter dönüşümü
  const trReplaced = text.replace(
    /[çğıöşüÇĞİÖŞÜ]/g,
    (match) => TR_CHAR_MAP[match] ?? match
  );

  // 2) Unicode normalization (NFD → accents ayrışır, sonra non-ASCII kaldırılır)
  const normalized = trReplaced
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 3) Slug dönüşümü
  return normalized
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")  // alfanumerik olmayan karakterler kaldır
    .replace(/\s+/g, "-")           // boşlukları tire yap
    .replace(/-{2,}/g, "-")         // ardışık tireleri tek tireye indir
    .replace(/^-|-$/g, "");         // baş/son tireleri kaldır
};

/**
 * Whiskey kataloğu için benzersiz, normalize edilmiş slug üretir.
 * Lookup sırası: distillery → brand → expression(name)
 *
 * Eğer distillery verilmemişse sadece brand + name kullanılır.
 * Tüm parçalar boşsa slug "unknown-whiskey" olarak döner.
 *
 * @param brand       - Whiskey markası (zorunlu)
 * @param expression  - Expression / ürün adı (zorunlu)
 * @param distillery  - Damıtmacı adı (opsiyonel — brand'den farklıysa ekle)
 * @returns           - URL-safe, benzersiz slug
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
 * Verilen metni başlık formatına (Title Case) dönüştürür.
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
 * Whiskey tipini normalize edilmiş bir enum değerine eşler.
 * Bilinmeyen tipler "Other" olarak döner.
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
