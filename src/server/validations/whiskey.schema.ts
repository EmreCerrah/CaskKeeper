import { z } from "zod";
import { mk } from "@/lib/i18n/message-key";

// ---------------------------------------------------------------------------
// Temel Whiskey Oluşturma Şeması (API endpoint'i için)
// ---------------------------------------------------------------------------

export const CreateWhiskeySchema = z.object({
  brand:          z.string().min(2, mk("validation.brandMin")).trim(),
  name:           z.string().min(2, mk("validation.whiskeyNameMin")).trim(),
  // Damıtımevi zorunludur: katalog kimliğinin (slug) parçasıdır ve aynı
  // marka/ürün adıyla farklı üreticileri ayırt etmeyi sağlar.
  distillery:     z.string().min(2, mk("validation.distilleryRequired")).trim(),
  type:           z.string().min(2, mk("validation.typeRequired")).trim(),
  region:         z.string().min(2, mk("validation.regionRequired")).trim(),
  country:        z.string().trim().default("Scotland"),
  subRegion:      z.string().trim().optional(),
  abv:            z.number().min(0, mk("validation.abvRange")).max(100, mk("validation.abvRange")),
  age:            z.number().int().positive().optional(),
  caskType:       z.string().trim().optional(),
  bottlingYear:   z.number().int().min(1700).max(new Date().getFullYear()).optional(),
  vintage:        z.number().int().min(1700).max(new Date().getFullYear()).optional(),
  limitedEdition: z.boolean().default(false),
  description:    z.string().trim().optional(),
  flavorProfile:  z.array(z.string().trim()).default([]),
  awards:         z.array(z.string().trim()).default([]),
  imageUrl:       z.string().url(mk("validation.url")).optional(),
  officialUrl:    z.string().url(mk("validation.url")).optional(),
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
