/**
 * @file WhiskeyRepository.ts
 * @description Whiskey koleksiyonu için MongoDB erişim katmanı.
 * Import pipeline ve API route'larının ihtiyaç duyduğu tüm CRUD + sorgu operasyonlarını kapsar.
 */

import Whiskey, { IWhiskey } from "../models/Whiskey";
import { CreateWhiskeyDTO, UpdateWhiskeyDTO } from "../validations/whiskey.schema";

// ---------------------------------------------------------------------------
// Sorgu Tipleri
// ---------------------------------------------------------------------------

export interface WhiskeyFilterOptions {
  /** Marka + isim üzerinde serbest metin araması (filtrelerle birlikte çalışır) */
  search?: string;
  type?: string;
  region?: string;
  country?: string;
  brand?: string;
  tags?: string[];
  limitedEdition?: boolean;
  minAbv?: number;
  maxAbv?: number;
  minAge?: number;
  maxAge?: number;
}

/** Katalog filtre seçenekleri (UI dropdown'ları için) */
export interface WhiskeyFacets {
  types: string[];
  regions: string[];
  countries: string[];
}

export interface WhiskeyPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: keyof IWhiskey;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Repository Sınıfı
// ---------------------------------------------------------------------------

export class WhiskeyRepository {
  // ---------- READ ----------

  /** Tüm whiskey'leri getir (opsiyonel filtre + sayfalama) */
  async findAll(
    filters?: WhiskeyFilterOptions,
    pagination?: WhiskeyPaginationOptions
  ): Promise<PaginatedResult<IWhiskey>> {
    const page  = Math.max(1, pagination?.page ?? 1);
    const limit = Math.min(100, pagination?.limit ?? 20);
    const skip  = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filters?.search) {
      const rx = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ brand: rx }, { name: rx }, { distillery: rx }];
    }
    if (filters?.type)            query.type     = filters.type;
    if (filters?.region)          query.region   = filters.region;
    if (filters?.country)         query.country  = filters.country;
    if (filters?.brand)           query.brand    = new RegExp(filters.brand, "i");
    if (filters?.limitedEdition !== undefined) query.limitedEdition = filters.limitedEdition;
    if (filters?.tags?.length)    query.tags     = { $in: filters.tags };
    if (filters?.minAbv !== undefined || filters?.maxAbv !== undefined) {
      query.abv = {
        ...(filters.minAbv !== undefined ? { $gte: filters.minAbv } : {}),
        ...(filters.maxAbv !== undefined ? { $lte: filters.maxAbv } : {}),
      };
    }
    if (filters?.minAge !== undefined || filters?.maxAge !== undefined) {
      query.age = {
        ...(filters.minAge !== undefined ? { $gte: filters.minAge } : {}),
        ...(filters.maxAge !== undefined ? { $lte: filters.maxAge } : {}),
      };
    }

    const sortField = pagination?.sortBy ?? "createdAt";
    const sortDir   = pagination?.sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      Whiskey.find(query)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean() as unknown as Promise<IWhiskey[]>,
      Whiskey.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** ID ile tek kayıt */
  async findById(id: string): Promise<IWhiskey | null> {
    return await Whiskey.findById(id).lean() as unknown as IWhiskey | null;
  }

  /** Slug ile tek kayıt (URL-safe lookup) */
  async findBySlug(slug: string): Promise<IWhiskey | null> {
    return await Whiskey.findOne({ slug }).lean() as unknown as IWhiskey | null;
  }

  /** externalId ile kayıt (idempotent import için) */
  async findByExternalId(externalId: string): Promise<IWhiskey | null> {
    return await Whiskey.findOne({ externalId }).lean() as unknown as IWhiskey | null;
  }

  /** Katalogdaki mevcut tip/bölge/ülke değerleri (filtre dropdown'ları için) */
  async getFacets(): Promise<WhiskeyFacets> {
    const [types, regions, countries] = await Promise.all([
      Whiskey.distinct("type"),
      Whiskey.distinct("region"),
      Whiskey.distinct("country"),
    ]);
    return {
      types: (types as string[]).filter(Boolean).sort(),
      regions: (regions as string[]).filter(Boolean).sort(),
      countries: (countries as string[]).filter(Boolean).sort(),
    };
  }

  /** Metin araması (brand, name, description, tags) */
  async search(query: string, limit = 20): Promise<IWhiskey[]> {
    return await Whiskey.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean() as unknown as IWhiskey[];
  }

  // ---------- WRITE ----------

  /** Yeni kayıt oluştur */
  async create(data: CreateWhiskeyDTO & { slug: string }): Promise<IWhiskey> {
    const whiskey = new Whiskey(data);
    return await whiskey.save() as unknown as IWhiskey;
  }

  /**
   * Slug veya externalId ile upsert — duplicate import güvenliği:
   * - Varsa: güncelle (updated döner)
   * - Yoksa: oluştur (null döner → yeni kayıt anlamına gelir)
   */
  async upsertBySlug(
    slug: string,
    data: Partial<CreateWhiskeyDTO> & { slug: string },
    externalId?: string
  ): Promise<{ doc: IWhiskey | null; isNew: boolean }> {
    const filter = externalId
      ? { $or: [{ slug }, { externalId }] }
      : { slug };

    const previous = await Whiskey.findOneAndUpdate(
      filter,
      { $set: data },
      { upsert: true, new: false, setDefaultsOnInsert: true }
    ).lean() as unknown as IWhiskey | null;

    return { doc: previous, isNew: previous === null };
  }

  /** ID ile güncelle */
  async update(id: string, data: UpdateWhiskeyDTO): Promise<IWhiskey | null> {
    return await Whiskey.findByIdAndUpdate(id, { $set: data }, { new: true }).lean() as unknown as IWhiskey | null;
  }

  /** ID ile sil */
  async delete(id: string): Promise<boolean> {
    const result = await Whiskey.findByIdAndDelete(id);
    return result !== null;
  }

  /** Slug var mı kontrolü (O(1) — lean+projection) */
  async existsBySlug(slug: string): Promise<boolean> {
    return !!(await Whiskey.exists({ slug }));
  }
}

export const whiskeyRepository = new WhiskeyRepository();
