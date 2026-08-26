/**
 * @file WhiskeyService.ts
 * @description The whisky business-rules layer.
 * Validation, slug generation and duplicate checking all happen here.
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
    if (!whiskey) throw new NotFoundError("errors.whiskeyNotFound");
    return toWhiskeyDTO(whiskey);
  }

  async getWhiskeyBySlug(slug: string): Promise<WhiskeyDTO> {
    const whiskey = await whiskeyRepository.findBySlug(slug);
    if (!whiskey) throw new NotFoundError("errors.whiskeyNotFoundSlug", { slug });
    return toWhiskeyDTO(whiskey);
  }

  /** Fetch by slug; returns null rather than throwing when missing (for the page's 404). */
  async findWhiskeyBySlug(slug: string): Promise<WhiskeyDTO | null> {
    const whiskey = await whiskeyRepository.findBySlug(slug);
    return whiskey ? toWhiskeyDTO(whiskey) : null;
  }

  /**
   * For the comparison page: fetches the given slugs in one query and
   * **preserves the order asked for** — the column order in the comparison
   * table has to match the order in the URL. Slugs that are not found are
   * skipped quietly (the URL may have been edited by hand, or the whisky
   * removed from the catalogue).
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
      throw new ValidationError("errors.invalidWhiskeyData", parsed.error.flatten().fieldErrors);
    }

    const dto = parsed.data;

    // 2. Normalise the type and build the slug
    const normalizedType = normalizeWhiskeyType(dto.type);
    const slug = generateWhiskeySlug(dto.brand, dto.name, dto.distillery);

    // 3. Duplicate check
    const exists = await whiskeyRepository.existsBySlug(slug);
    if (exists) {
      throw new ConflictError("errors.whiskeyAlreadyExists", { slug });
    }

    // 4. Save
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
      throw new ValidationError("errors.invalidWhiskeyData", parsed.error.flatten().fieldErrors);
    }

    const updated = await whiskeyRepository.update(id, parsed.data as UpdateWhiskeyDTO);
    if (!updated) throw new NotFoundError("errors.whiskeyNotFound");
    return toWhiskeyDTO(updated);
  }

  /**
   * Update by slug (for the admin panel and the API).
   * If the brand, name or distillery changes the slug is regenerated; if that
   * new slug belongs to another record the update fails with a conflict rather
   * than quietly overwriting it.
   */
  async updateWhiskeyBySlug(slug: string, data: unknown): Promise<WhiskeyDTO> {
    const parsed = UpdateWhiskeySchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("errors.invalidWhiskeyData", parsed.error.flatten().fieldErrors);
    }

    const existing = await whiskeyRepository.findBySlug(slug);
    if (!existing) throw new NotFoundError("errors.whiskeyNotFoundSlug", { slug });

    const dto = { ...parsed.data } as UpdateWhiskeyDTO & { slug?: string };

    if (dto.type) dto.type = normalizeWhiskeyType(dto.type);

    // Refresh the slug if any of the identity fields changed
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
          throw new ConflictError("errors.whiskeyConflict", { slug: nextSlug });
        }
        dto.slug = nextSlug;
      }
    }

    const updated = await whiskeyRepository.update(String(existing._id), dto);
    if (!updated) throw new NotFoundError("errors.whiskeyNotFound");
    return toWhiskeyDTO(updated);
  }

  async deleteWhiskey(id: string): Promise<void> {
    const deleted = await whiskeyRepository.delete(id);
    if (!deleted) throw new NotFoundError("errors.whiskeyNotFound");
  }

  async deleteWhiskeyBySlug(slug: string): Promise<void> {
    const existing = await whiskeyRepository.findBySlug(slug);
    if (!existing) throw new NotFoundError("errors.whiskeyNotFoundSlug", { slug });
    await whiskeyRepository.delete(String(existing._id));
  }
}

export const whiskeyService = new WhiskeyService();
