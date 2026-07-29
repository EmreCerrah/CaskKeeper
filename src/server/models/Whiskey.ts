/**
 * @file Whiskey.ts
 * @description Merkezi whisky kataloğu için Mongoose modeli.
 * Import pipeline'ından gelen NormalizedWhiskeyPayload ile birebir eşleşir.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IWhiskey extends Document {
  // Kimlik
  brand: string;
  name: string;           // expression / ürün adı
  slug: string;           // duplicate prevention & URL-safe

  // Sınıflandırma
  distillery?: string;
  type: string;
  region: string;
  country: string;
  subRegion?: string;

  // Teknik
  abv: number;
  age?: number;
  caskType?: string;
  bottlingYear?: number;
  vintage?: number;
  limitedEdition: boolean;

  // İçerik
  description?: string;
  flavorProfile: string[];
  awards: string[];

  // Meta
  imageUrl?: string;
  officialUrl?: string;
  tags: string[];
  externalId?: string;   // dış sistemdeki ID (idempotent import için)
  source: string;        // veri kaynağı: "manual" | "whiskybase" | "api" vs.

  // Timestamps (mongoose otomatik ekler)
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const WhiskeySchema = new Schema<IWhiskey>(
  {
    // Kimlik
    brand:       { type: String, required: true, trim: true, index: true },
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, index: true, lowercase: true },

    // Sınıflandırma
    distillery:  { type: String, trim: true },
    type:        { type: String, required: true, trim: true, index: true },
    region:      { type: String, required: true, trim: true },
    country:     { type: String, required: true, trim: true, default: "Scotland" },
    subRegion:   { type: String, trim: true },

    // Teknik
    abv:            { type: Number, required: true, min: 0, max: 100 },
    age:            { type: Number, min: 0 },
    caskType:       { type: String, trim: true },
    bottlingYear:   { type: Number },
    vintage:        { type: Number },
    limitedEdition: { type: Boolean, default: false },

    // İçerik
    description:   { type: String, trim: true },
    flavorProfile: { type: [String], default: [] },
    awards:        { type: [String], default: [] },

    // Meta
    imageUrl:   { type: String, trim: true },
    officialUrl:{ type: String, trim: true },
    tags:       { type: [String], default: [], index: true },
    externalId: { type: String, trim: true, sparse: true },
    source:     { type: String, required: true, default: "manual" },
  },
  {
    timestamps: true,
    // Lean sorgularda virtuals çalışmaz, bu yüzden toJSON/toObject'e ekleyebiliriz
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// İndeksler
// ---------------------------------------------------------------------------

// Catalog'da arama için compound unique index (slug zaten unique ama bu daha okunabilir)
WhiskeySchema.index({ brand: 1, name: 1 }, { unique: true });

// Tip + bölge bazlı filtreleme için
WhiskeySchema.index({ type: 1, region: 1 });

// Metin araması için (Türkçe locale önerisi: "tr")
WhiskeySchema.index(
  { brand: "text", name: "text", description: "text", tags: "text" },
  { name: "whiskey_text_search", weights: { brand: 10, name: 8, tags: 5, description: 1 } }
);

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

const Whiskey: Model<IWhiskey> =
  mongoose.models.Whiskey ?? mongoose.model<IWhiskey>("Whiskey", WhiskeySchema);

export default Whiskey;
