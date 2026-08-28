/**
 * @file whiskey-import.types.ts
 * @description The type definitions for the import pipeline.
 * They model each step from the external format (an API or a JSON file) to a
 * MongoDB document.
 */

// ---------------------------------------------------------------------------
// 1. RAW INPUT FORMAT — data from an external source (an API or a JSON file)
// ---------------------------------------------------------------------------

/**
 * The raw shape expected from an import source.
 * Every field is optional; the fallbacks are applied in the import pipeline.
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
  // Identity fields
  brand?: string;
  expression?: string; // ürün adı / expression — "name" alias da kabul edilir
  name?: string;       // "expression" ile aynı anlam, geriye dönük uyumluluk için
  distillery?: string;

  // Classification
  type?: string;
  region?: string;
  country?: string;
  subRegion?: string;

  // Technical
  abv?: number | string;
  age?: number | string;
  caskType?: string;
  bottlingYear?: number | string;
  vintage?: number | string;
  limitedEdition?: boolean;

  // Content
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
// 2. NORMALISED PAYLOAD — validated data, ready to be written to MongoDB
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
// 3. IMPORT RESULT TYPES
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
  /** In dry-run mode nothing is written to MongoDB, only logged. */
  dryRun?: boolean;
  /** Existing records are left alone; only new ones are added. */
  insertOnly?: boolean;
  /** Skip records that fail validation (true), or stop (false). */
  skipInvalid?: boolean;
  /** Delay per record in ms — for rate limiting. */
  delayMs?: number;
  /** A label for the data source. */
  source?: string;
}
