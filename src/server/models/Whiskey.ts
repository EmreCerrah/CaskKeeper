/**
 * @file Whiskey.ts
 * @description The Mongoose model for the central whisky catalogue.
 * Matches the NormalizedWhiskeyPayload coming out of the import pipeline
 * one-for-one.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IWhiskey extends Document {
  // Identity
  brand: string;
  name: string;           // expression / product name
  slug: string;           // duplicate prevention & URL-safe

  // Classification
  /** Required — part of the catalogue identity, and it goes into the slug */
  distillery: string;
  type: string;
  region: string;
  country: string;
  subRegion?: string;

  // Technical
  abv: number;
  age?: number;
  caskType?: string;
  bottlingYear?: number;
  vintage?: number;
  limitedEdition: boolean;

  // Content
  description?: string;
  flavorProfile: string[];
  awards: string[];

  // Meta
  imageUrl?: string;
  officialUrl?: string;
  tags: string[];
  externalId?: string;   // the id in the external system (keeps imports idempotent)
  source: string;        // the data source: "manual" | "whiskybase" | "api" etc.

  // Timestamps (Mongoose adds these itself)
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const WhiskeySchema = new Schema<IWhiskey>(
  {
    // Identity
    brand:       { type: String, required: true, trim: true, index: true },
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, index: true, lowercase: true },

    // Classification
    distillery:  { type: String, required: true, trim: true },
    type:        { type: String, required: true, trim: true, index: true },
    region:      { type: String, required: true, trim: true },
    country:     { type: String, required: true, trim: true, default: "Scotland" },
    subRegion:   { type: String, trim: true },

    // Technical
    abv:            { type: Number, required: true, min: 0, max: 100 },
    age:            { type: Number, min: 0 },
    caskType:       { type: String, trim: true },
    bottlingYear:   { type: Number },
    vintage:        { type: Number },
    limitedEdition: { type: Boolean, default: false },

    // Content
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
    // Virtuals do not run on lean queries, so they can be added to toJSON/toObject
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Catalogue identity: distillery + brand + product name are unique together.
// The distillery is included deliberately — bottlings of the same brand and
// product name from different distilleries (independent bottlings) are
// separate records. This is exactly the trio the slug is derived from.
WhiskeySchema.index({ brand: 1, name: 1, distillery: 1 }, { unique: true });

// For filtering by type and region
WhiskeySchema.index({ type: 1, region: 1 });

// For text search (a Turkish locale, "tr", is the suggested setting)
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
