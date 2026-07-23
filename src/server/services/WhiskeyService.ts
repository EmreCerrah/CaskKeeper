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

  async deleteWhiskey(id: string): Promise<void> {
    const deleted = await whiskeyRepository.delete(id);
    if (!deleted) throw new NotFoundError("Viski bulunamadı");
  }
}

export const whiskeyService = new WhiskeyService();
