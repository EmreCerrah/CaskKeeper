/**
 * @file WhiskeyService.ts
 * @description Whiskey iş mantığı katmanı.
 * Validation, slug üretimi ve duplicate kontrolü burada yapılır.
 */

import { whiskeyRepository } from "../repositories/WhiskeyRepository";
import type {
  WhiskeyFilterOptions,
  WhiskeyPaginationOptions,
  WhiskeyFacets,
} from "../repositories/WhiskeyRepository";
import { CreateWhiskeySchema, UpdateWhiskeyDTO, UpdateWhiskeySchema } from "../validations/whiskey.schema";
import { generateWhiskeySlug, normalizeWhiskeyType } from "@/lib/utils/normalize";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { toWhiskeyDTO, type WhiskeyDTO } from "@/lib/types/dto";
import type { IWhiskey } from "../models/Whiskey";

export interface PaginatedWhiskeys {
  data: WhiskeyDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class WhiskeyService {
  // ---------- READ ----------

  async getAllWhiskeys(
    filters?: WhiskeyFilterOptions,
    pagination?: WhiskeyPaginationOptions
  ): Promise<PaginatedWhiskeys> {
    const result = await whiskeyRepository.findAll(filters, pagination);
    return { ...result, data: result.data.map(toWhiskeyDTO) };
  }

  async getWhiskeyById(id: string): Promise<WhiskeyDTO> {
    const whiskey = await whiskeyRepository.findById(id);
    if (!whiskey) throw new NotFoundError("Viski bulunamadı");
    return toWhiskeyDTO(whiskey);
  }

  async getWhiskeyBySlug(slug: string): Promise<WhiskeyDTO> {
    const whiskey = await whiskeyRepository.findBySlug(slug);
    if (!whiskey) throw new NotFoundError(`Viski bulunamadı: ${slug}`);
    return toWhiskeyDTO(whiskey);
  }

  /** Slug ile getir; bulunamazsa hata yerine null döner (sayfa 404'ü için) */
  async findWhiskeyBySlug(slug: string): Promise<WhiskeyDTO | null> {
    const whiskey = await whiskeyRepository.findBySlug(slug);
    return whiskey ? toWhiskeyDTO(whiskey) : null;
  }

  /**
   * Karşılaştırma için: verilen slug'ları tek sorguda getirir ve **istenen
   * sırayı korur** — karşılaştırma tablosundaki sütun sırası URL'deki sırayla
   * aynı kalmalı. Bulunamayan slug'lar sessizce atlanır (URL elle düzenlenmiş
   * ya da viski katalogdan silinmiş olabilir).
   */
  async getWhiskeysBySlugs(slugs: string[]): Promise<WhiskeyDTO[]> {
    if (slugs.length === 0) return [];

    const found = await whiskeyRepository.findBySlugs(slugs);
    const bySlug = new Map(found.map((whiskey) => [whiskey.slug, whiskey]));

    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((whiskey): whiskey is IWhiskey => whiskey !== undefined)
      .map(toWhiskeyDTO);
  }

  async searchWhiskeys(query: string, limit?: number): Promise<WhiskeyDTO[]> {
    const results = await whiskeyRepository.search(query, limit);
    return results.map(toWhiskeyDTO);
  }

  async getFacets(): Promise<WhiskeyFacets> {
    return await whiskeyRepository.getFacets();
  }

  // ---------- WRITE ----------

  async createWhiskey(data: unknown): Promise<WhiskeyDTO> {
    // 1. Validation
    const parsed = CreateWhiskeySchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Geçersiz viski verisi", parsed.error.flatten().fieldErrors);
    }

    const dto = parsed.data;

    // 2. Normalize type ve slug üret
    const normalizedType = normalizeWhiskeyType(dto.type);
    const slug = generateWhiskeySlug(dto.brand, dto.name, dto.distillery);

    // 3. Duplicate kontrolü
    const exists = await whiskeyRepository.existsBySlug(slug);
    if (exists) {
      throw new ConflictError(`Bu viski katalogda zaten mevcut (slug: ${slug})`);
    }

    // 4. Kaydet
    const created = await whiskeyRepository.create({
      ...dto,
      type: normalizedType,
      slug,
    });
    return toWhiskeyDTO(created);
  }

  async updateWhiskey(id: string, data: unknown): Promise<WhiskeyDTO> {
    const parsed = UpdateWhiskeySchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Geçersiz viski verisi", parsed.error.flatten().fieldErrors);
    }

    const updated = await whiskeyRepository.update(id, parsed.data as UpdateWhiskeyDTO);
    if (!updated) throw new NotFoundError("Viski bulunamadı");
    return toWhiskeyDTO(updated);
  }

  /**
   * Slug ile güncelleme (yönetim paneli ve API için).
   * Marka/isim/damıtımevi değişirse slug yeniden üretilir; yeni slug başka bir
   * kayda aitse çakışma hatası verilir (sessizce üzerine yazılmaz).
   */
  async updateWhiskeyBySlug(slug: string, data: unknown): Promise<WhiskeyDTO> {
    const parsed = UpdateWhiskeySchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Geçersiz viski verisi", parsed.error.flatten().fieldErrors);
    }

    const existing = await whiskeyRepository.findBySlug(slug);
    if (!existing) throw new NotFoundError(`Viski bulunamadı: ${slug}`);

    const dto = { ...parsed.data } as UpdateWhiskeyDTO & { slug?: string };

    if (dto.type) dto.type = normalizeWhiskeyType(dto.type);

    // Kimlik alanlarından biri değiştiyse slug'ı tazele
    const identityChanged =
      (dto.brand !== undefined && dto.brand !== existing.brand) ||
      (dto.name !== undefined && dto.name !== existing.name) ||
      (dto.distillery !== undefined && dto.distillery !== existing.distillery);

    if (identityChanged) {
      const nextSlug = generateWhiskeySlug(
        dto.brand ?? existing.brand,
        dto.name ?? existing.name,
        dto.distillery ?? existing.distillery
      );

      if (nextSlug !== slug) {
        const clash = await whiskeyRepository.findBySlug(nextSlug);
        if (clash) {
          throw new ConflictError(`Bu bilgilerle başka bir viski zaten mevcut (slug: ${nextSlug})`);
        }
        dto.slug = nextSlug;
      }
    }

    const updated = await whiskeyRepository.update(String(existing._id), dto);
    if (!updated) throw new NotFoundError("Viski bulunamadı");
    return toWhiskeyDTO(updated);
  }

  async deleteWhiskey(id: string): Promise<void> {
    const deleted = await whiskeyRepository.delete(id);
    if (!deleted) throw new NotFoundError("Viski bulunamadı");
  }

  async deleteWhiskeyBySlug(slug: string): Promise<void> {
    const existing = await whiskeyRepository.findBySlug(slug);
    if (!existing) throw new NotFoundError(`Viski bulunamadı: ${slug}`);
    await whiskeyRepository.delete(String(existing._id));
  }
}

export const whiskeyService = new WhiskeyService();
