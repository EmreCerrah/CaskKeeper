import { z } from "zod";

// ---------------------------------------------------------------------------
// Temel Whiskey Oluşturma Şeması (API endpoint'i için)
// ---------------------------------------------------------------------------

export const CreateWhiskeySchema = z.object({
  brand:          z.string().min(2, "Marka adı en az 2 karakter olmalı").trim(),
  name:           z.string().min(2, "Ürün adı en az 2 karakter olmalı").trim(),
  distillery:     z.string().trim().optional(),
  type:           z.string().min(2, "Tip zorunludur").trim(),
  region:         z.string().min(2, "Bölge zorunludur").trim(),
  country:        z.string().trim().default("Scotland"),
  subRegion:      z.string().trim().optional(),
  abv:            z.number().min(0, "ABV negatif olamaz").max(100, "ABV 100'ü geçemez"),
  age:            z.number().int().positive().optional(),
  caskType:       z.string().trim().optional(),
  bottlingYear:   z.number().int().min(1700).max(new Date().getFullYear()).optional(),
  vintage:        z.number().int().min(1700).max(new Date().getFullYear()).optional(),
  limitedEdition: z.boolean().default(false),
  description:    z.string().trim().optional(),
  flavorProfile:  z.array(z.string().trim()).default([]),
  awards:         z.array(z.string().trim()).default([]),
  imageUrl:       z.string().url("Geçerli bir URL giriniz").optional(),
  officialUrl:    z.string().url("Geçerli bir URL giriniz").optional(),
  tags:           z.array(z.string().trim().toLowerCase()).default([]),
  externalId:     z.string().trim().optional(),
  source:         z.string().default("manual"),
});

export type CreateWhiskeyDTO = z.infer<typeof CreateWhiskeySchema>;

// ---------------------------------------------------------------------------
// Import Pipeline Şeması (ham/dış veri için — daha toleranslı)
// ---------------------------------------------------------------------------

/**
 * Dış kaynaktan gelen ham veriyi parse etmek için kullanılan şema.
 * - abv ve age string olarak da gelebilir → coerce ile number'a dönüştürülür.
 * - Eksik zorunlu alanlar buraya kadar çıkmaz; fallback import pipeline'ında uygulanır.
 */
export const ImportWhiskeySchema = z.object({
  brand:          z.string().trim().optional(),
  expression:     z.string().trim().optional(),
  name:           z.string().trim().optional(), // "expression" alias
  distillery:     z.string().trim().optional(),
  type:           z.string().trim().optional(),
  region:         z.string().trim().optional(),
  country:        z.string().trim().optional(),
  subRegion:      z.string().trim().optional(),
  abv:            z.coerce.number().min(0).max(100).optional(),
  age:            z.coerce.number().int().positive().optional(),
  caskType:       z.string().trim().optional(),
  bottlingYear:   z.coerce.number().int().min(1700).optional(),
  vintage:        z.coerce.number().int().min(1700).optional(),
  limitedEdition: z.boolean().optional(),
  description:    z.string().trim().optional(),
  flavorProfile:  z.array(z.string().trim()).optional(),
  awards:         z.array(z.string().trim()).optional(),
  imageUrl:       z.string().url().optional().or(z.literal("")),
  officialUrl:    z.string().url().optional().or(z.literal("")),
  tags:           z.array(z.string().trim()).optional(),
  externalId:     z.string().trim().optional(),
  source:         z.string().trim().optional(),
});

export type ImportWhiskeyInput = z.infer<typeof ImportWhiskeySchema>;

// ---------------------------------------------------------------------------
// Güncelleme Şeması
// ---------------------------------------------------------------------------

export const UpdateWhiskeySchema = CreateWhiskeySchema.partial();
export type UpdateWhiskeyDTO = z.infer<typeof UpdateWhiskeySchema>;
