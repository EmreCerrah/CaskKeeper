/**
 * @file whiskey-import.types.ts
 * @description Import pipeline için tip tanımları.
 * Dış kaynak (API / JSON) formatından MongoDB dokümanına dönüşüm adımlarını modeller.
 */

// ---------------------------------------------------------------------------
// 1. RAW INPUT FORMAT — Dış kaynak (API / JSON dosyası) verisi
// ---------------------------------------------------------------------------

/**
 * Import kaynağından beklenen ham veri formatı.
 * Tüm alanlar opsiyoneldir; fallback değerleri import pipeline'ında uygulanır.
 *
 * @example
 * {
 *   "brand": "Lagavulin",
 *   "expression": "16 Year Old",
 *   "distillery": "Lagavulin Distillery",
 *   "type": "Single Malt",
 *   "region": "Islay",
 *   "country": "Scotland",
 *   "abv": 43.0,
 *   "age": 16,
 *   "caskType": "Ex-Bourbon & Sherry",
 *   "description": "Peat, smoke, dried fruit.",
 *   "imageUrl": "https://example.com/lagavulin-16.jpg",
 *   "tags": ["peated", "smoky", "islay"],
 *   "externalId": "lagavulin-16-master-distillers"
 * }
 */
export interface RawWhiskeyInput {
  // Kimlik alanları
  brand?: string;
  expression?: string; // ürün adı / expression — "name" alias da kabul edilir
  name?: string;       // "expression" ile aynı anlam, geriye dönük uyumluluk için
  distillery?: string;

  // Sınıflandırma
  type?: string;
  region?: string;
  country?: string;
  subRegion?: string;

  // Teknik
  abv?: number | string;
  age?: number | string;
  caskType?: string;
  bottlingYear?: number | string;
  vintage?: number | string;
  limitedEdition?: boolean;

  // İçerik
  description?: string;
  flavorProfile?: string[];
  awards?: string[];

  // Meta
  imageUrl?: string;
  officialUrl?: string;
  tags?: string[];
  externalId?: string; // dış sistemdeki ID (idempotent import için ek kontrol)
  source?: string;     // veri kaynağı etiketi: "whiskybase", "thewhiskylibrary", "manual" vs.
}

// ---------------------------------------------------------------------------
// 2. NORMALIZED PAYLOAD — Validation'dan geçmiş, MongoDB'ye yazılmaya hazır veri
// ---------------------------------------------------------------------------

export interface NormalizedWhiskeyPayload {
  brand: string;
  name: string;          // expression
  slug: string;
  distillery?: string;
  type: string;
  region: string;
  country: string;
  subRegion?: string;
  abv: number;
  age?: number;
  caskType?: string;
  bottlingYear?: number;
  vintage?: number;
  limitedEdition: boolean;
  description?: string;
  flavorProfile: string[];
  awards: string[];
  imageUrl?: string;
  officialUrl?: string;
  tags: string[];
  externalId?: string;
  source: string;
}

// ---------------------------------------------------------------------------
// 3. IMPORT SONUÇ TİPLERİ
// ---------------------------------------------------------------------------

export type ImportAction = "created" | "updated" | "skipped" | "failed";

export interface ImportResult {
  action: ImportAction;
  slug: string;
  brand: string;
  expression: string;
  reason?: string; // hata veya skip nedeni
}

export interface ImportSummary {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  results: ImportResult[];
  durationMs: number;
}

// ---------------------------------------------------------------------------
// 4. IMPORT CONFIG
// ---------------------------------------------------------------------------

export interface ImportConfig {
  /** Dry-run modunda MongoDB'ye yazılmaz, sadece loglanır */
  dryRun?: boolean;
  /** Mevcut kayıtlar güncellenmez, sadece yeniler eklenir */
  insertOnly?: boolean;
  /** Validation başarısız olan kayıtları atla (true) ya da dur (false) */
  skipInvalid?: boolean;
  /** Kayıt başına batch delay (ms) — rate limiting için */
  delayMs?: number;
  /** Veri kaynağı etiketi */
  source?: string;
}
