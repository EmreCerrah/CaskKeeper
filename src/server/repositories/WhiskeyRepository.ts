/**
 * @file WhiskeyRepository.ts
 * @description The MongoDB access layer for the Whiskey collection.
 * Covers every CRUD and query operation the import pipeline and the API routes
 * need.
 */

import Whiskey, { IWhiskey } from "../models/Whiskey";
import { CreateWhiskeyDTO, UpdateWhiskeyDTO } from "../validations/whiskey.schema";
import { escapeRegex } from "@/lib/utils/normalize";

// ---------------------------------------------------------------------------
// Query types
// ---------------------------------------------------------------------------

export interface WhiskeyFilterOptions {
  /** Free-text search over brand and name (works alongside the filters). */
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

/** The catalogue's filter options (for the dropdowns in the UI). */
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
// The repository class
// ---------------------------------------------------------------------------

export class WhiskeyRepository {
  // ---------- READ ----------

  /** Fetches whiskies (optional filters, paginated). */
  async findAll(
    filters?: WhiskeyFilterOptions,
    pagination?: WhiskeyPaginationOptions
  ): Promise<PaginatedResult<IWhiskey>> {
    const page  = Math.max(1, pagination?.page ?? 1);
    const limit = Math.min(100, pagination?.limit ?? 20);
    const skip  = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filters?.search) {
      const rx = new RegExp(escapeRegex(filters.search), "i");
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

  /** A single record by id. */
  async findById(id: string): Promise<IWhiskey | null> {
    return await Whiskey.findById(id).lean() as unknown as IWhiskey | null;
  }

  /** A single record by slug (the URL-safe lookup). */
  async findBySlug(slug: string): Promise<IWhiskey | null> {
    return await Whiskey.findOne({ slug }).lean() as unknown as IWhiskey | null;
  }

  /** A record by externalId (so imports stay idempotent). */
  async findByExternalId(externalId: string): Promise<IWhiskey | null> {
    return await Whiskey.findOne({ externalId }).lean() as unknown as IWhiskey | null;
  }

  /**
   * Fetches several slugs in one query (for the comparison page).
   * The order of the results is not guaranteed — the caller sorts them into
   * whatever order it wants.
   */
  async findBySlugs(slugs: string[]): Promise<IWhiskey[]> {
    if (slugs.length === 0) return [];
    return await Whiskey.find({ slug: { $in: slugs } }).lean() as unknown as IWhiskey[];
  }

  /** The type/region/country values actually present in the catalogue (for the filter dropdowns). */
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

  /**
   * Candidate whiskies for the recommendation engine: the whole catalogue
   * minus the given ids. Only the fields scoring needs are selected, keeping
   * the query light, and a `cap` guards against the catalogue's size.
   */
  async findRecommendationCandidates(excludeIds: string[], cap = 2000): Promise<IWhiskey[]> {
    return await Whiskey.find({ _id: { $nin: excludeIds } })
      .limit(cap)
      .lean() as unknown as IWhiskey[];
  }

  /** Text search (brand, name, description, tags). */
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

  /** Creates a new record. */
  async create(data: CreateWhiskeyDTO & { slug: string }): Promise<IWhiskey> {
    const whiskey = new Whiskey(data);
    return await whiskey.save() as unknown as IWhiskey;
  }

  /**
   * Upserts by slug or externalId — the guard against duplicate imports:
   * - present: update it (returns the updated record)
   * - absent: create it (returns null, meaning a new record)
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

  /** Updates by id (the service may regenerate the slug). */
  async update(id: string, data: UpdateWhiskeyDTO & { slug?: string }): Promise<IWhiskey | null> {
    return await Whiskey.findByIdAndUpdate(id, { $set: data }, { new: true }).lean() as unknown as IWhiskey | null;
  }

  /** Deletes by id. */
  async delete(id: string): Promise<boolean> {
    const result = await Whiskey.findByIdAndDelete(id);
    return result !== null;
  }

  /** Does this slug exist (O(1) — lean + projection). */
  async existsBySlug(slug: string): Promise<boolean> {
    return !!(await Whiskey.exists({ slug }));
  }
}

export const whiskeyRepository = new WhiskeyRepository();
