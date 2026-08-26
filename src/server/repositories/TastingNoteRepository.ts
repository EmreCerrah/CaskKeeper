/**
 * @file TastingNoteRepository.ts
 * @description The MongoDB access layer for the TastingNote collection.
 * Every query is scoped to a user — one person's notes never leak to another.
 */

import mongoose from "mongoose";
import TastingNote, { ITastingNote } from "../models/TastingNote";
import type { PaginatedResult } from "./WhiskeyRepository";
import type { CreateTastingNoteDTO, UpdateTastingNoteDTO } from "../validations/tasting-note.schema";
import type { CatalogDistributionDTO, DistributionItemDTO } from "@/lib/types/dto";
import type { NoteTagsInput } from "@/lib/utils/analytics";

export interface TastingNoteFilterOptions {
  whiskeyId?: string;
  onlyFavorites?: boolean;
}

export interface TastingNotePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: "tastingDate" | "rating" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface UserTastingStats {
  totalNotes: number;
  distinctWhiskeys: number;
  averageRating: number | null;
  favoriteCount: number;
  topFlavorTags: { tag: string; count: number }[];
}

export class TastingNoteRepository {
  // ---------- READ ----------

  /** The user's notes (whisky populated, paginated). */
  async findByUser(
    userId: string,
    filters?: TastingNoteFilterOptions,
    pagination?: TastingNotePaginationOptions
  ): Promise<PaginatedResult<ITastingNote>> {
    const page = Math.max(1, pagination?.page ?? 1);
    const limit = Math.min(100, pagination?.limit ?? 20);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { user: userId };
    if (filters?.whiskeyId) query.whiskey = filters.whiskeyId;
    if (filters?.onlyFavorites) query.isFavorite = true;

    const sortField = pagination?.sortBy ?? "tastingDate";
    const sortDir = pagination?.sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      TastingNote.find(query)
        .sort({ [sortField]: sortDir, createdAt: sortDir })
        .skip(skip)
        .limit(limit)
        .populate("whiskey")
        .lean() as unknown as Promise<ITastingNote[]>,
      TastingNote.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<ITastingNote | null> {
    return await TastingNote.findById(id).populate("whiskey").lean() as unknown as ITastingNote | null;
  }

  /** Every note the user wrote about one whisky (for the detail page). */
  async findByUserAndWhiskey(userId: string, whiskeyId: string): Promise<ITastingNote[]> {
    return await TastingNote.find({ user: userId, whiskey: whiskeyId })
      .sort({ tastingDate: -1 })
      .lean() as unknown as ITastingNote[];
  }

  /** A user's PUBLIC notes (the ones other people can see). */
  async findPublicByUser(
    userId: string,
    pagination?: TastingNotePaginationOptions
  ): Promise<PaginatedResult<ITastingNote>> {
    const page = Math.max(1, pagination?.page ?? 1);
    const limit = Math.min(100, pagination?.limit ?? 20);
    const skip = (page - 1) * limit;

    const query = { user: userId, visibility: "public" };

    const [data, total] = await Promise.all([
      TastingNote.find(query)
        .sort({ tastingDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("whiskey")
        .lean() as unknown as Promise<ITastingNote[]>,
      TastingNote.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async countPublicByUser(userId: string): Promise<number> {
    return await TastingNote.countDocuments({ user: userId, visibility: "public" });
  }

  /**
   * Returns the public note counts for several users in one aggregate.
   * It exists so search and discovery lists do not count per user.
   */
  async countPublicByUsers(userIds: string[]): Promise<Map<string, number>> {
    if (userIds.length === 0) return new Map();

    const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id));

    const rows = await TastingNote.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { user: { $in: objectIds }, visibility: "public" } },
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((r) => [String(r._id), r.count]));
  }

  /**
   * The activity feed: the PUBLIC notes of the given users, newest first.
   * Whisky and author are populated.
   */
  async findFeed(
    authorIds: mongoose.Types.ObjectId[],
    pagination?: TastingNotePaginationOptions
  ): Promise<PaginatedResult<ITastingNote>> {
    const page = Math.max(1, pagination?.page ?? 1);
    const limit = Math.min(100, pagination?.limit ?? 20);
    const skip = (page - 1) * limit;

    if (authorIds.length === 0) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const query = { user: { $in: authorIds }, visibility: "public" };

    const [data, total] = await Promise.all([
      TastingNote.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("whiskey")
        .populate("user", "name profilePicture")
        .lean() as unknown as Promise<ITastingNote[]>,
      TastingNote.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Dashboard statistics — a single aggregate pass. */
  async getStatsByUser(userId: string): Promise<UserTastingStats> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [result] = await TastingNote.aggregate([
      { $match: { user: userObjectId } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalNotes: { $sum: 1 },
                averageRating: { $avg: "$rating" },
                favoriteCount: { $sum: { $cond: ["$isFavorite", 1, 0] } },
                whiskeys: { $addToSet: "$whiskey" },
              },
            },
          ],
          tags: [
            {
              $project: {
                allTags: { $concatArrays: ["$noseTags", "$palateTags", "$finishTags"] },
              },
            },
            { $unwind: "$allTags" },
            { $group: { _id: "$allTags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
          ],
        },
      },
    ]);

    const totals = result?.totals?.[0];
    return {
      totalNotes: totals?.totalNotes ?? 0,
      distinctWhiskeys: totals?.whiskeys?.length ?? 0,
      averageRating: totals?.averageRating != null ? Math.round(totals.averageRating * 10) / 10 : null,
      favoriteCount: totals?.favoriteCount ?? 0,
      topFlavorTags: (result?.tags ?? []).map((t: { _id: string; count: number }) => ({
        tag: t._id,
        count: t.count,
      })),
    };
  }

  /**
   * For the aroma trend analytics: only the date and tag fields from the
   * user's notes — a light query, with the category mapping done in the
   * application layer.
   */
  async findTagsByUser(userId: string): Promise<NoteTagsInput[]> {
    return await TastingNote.find({ user: userId })
      .select("tastingDate noseTags palateTags finishTags")
      .sort({ tastingDate: 1 })
      .lean() as unknown as NoteTagsInput[];
  }

  /**
   * The type/region/distillery distribution of the whiskies behind the user's
   * tasting notes — via $facet, in a single aggregate pass.
   */
  async getCatalogDistributionByUser(userId: string): Promise<CatalogDistributionDTO> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [result] = await TastingNote.aggregate([
      { $match: { user: userObjectId } },
      {
        $lookup: {
          from: "whiskeys",
          localField: "whiskey",
          foreignField: "_id",
          as: "whiskeyDoc",
        },
      },
      { $unwind: "$whiskeyDoc" },
      {
        $facet: {
          byType: [
            { $group: { _id: "$whiskeyDoc.type", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byRegion: [
            { $group: { _id: "$whiskeyDoc.region", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          byDistillery: [
            { $group: { _id: "$whiskeyDoc.distillery", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
          ],
        },
      },
    ]);

    const toItems = (rows: { _id: string; count: number }[] | undefined): DistributionItemDTO[] =>
      (rows ?? []).map((r) => ({ label: r._id, count: r.count }));

    return {
      byType: toItems(result?.byType),
      byRegion: toItems(result?.byRegion),
      byDistillery: toItems(result?.byDistillery),
    };
  }

  /**
   * For the recommendation engine: the unique ids of every whisky the user has
   * written a note about — used to exclude them from the suggestions.
   */
  async findTastedWhiskeyIds(userId: string): Promise<string[]> {
    const ids = await TastingNote.distinct("whiskey", { user: userId });
    return ids.map(String);
  }

  // ---------- WRITE ----------

  async create(userId: string, data: CreateTastingNoteDTO): Promise<ITastingNote> {
    const note = new TastingNote({ ...data, user: userId });
    const saved = await note.save();
    return saved.toObject() as unknown as ITastingNote;
  }

  async update(id: string, data: UpdateTastingNoteDTO): Promise<ITastingNote | null> {
    return await TastingNote.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate("whiskey")
      .lean() as unknown as ITastingNote | null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await TastingNote.findByIdAndDelete(id);
    return result !== null;
  }
}

export const tastingNoteRepository = new TastingNoteRepository();
