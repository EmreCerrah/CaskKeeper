/**
 * @file WishlistRepository.ts
 * @description The MongoDB access layer for the wishlist.
 */

import Wishlist, { IWishlistItem } from "../models/Wishlist";
import type { PaginatedResult } from "./WhiskeyRepository";
import type { IWhiskey } from "../models/Whiskey";

export interface WishlistPaginationOptions {
  page?: number;
  limit?: number;
}

export class WishlistRepository {
  /** Adds an entry. Idempotent if one exists; returns true when a record was created. */
  async add(userId: string, whiskeyId: string): Promise<boolean> {
    const result = await Wishlist.updateOne(
      { user: userId, whiskey: whiskeyId },
      { $setOnInsert: { user: userId, whiskey: whiskeyId } },
      { upsert: true }
    );
    return result.upsertedCount > 0;
  }

  /** Removes an entry. Returns true when a record was actually deleted. */
  async remove(userId: string, whiskeyId: string): Promise<boolean> {
    const result = await Wishlist.deleteOne({ user: userId, whiskey: whiskeyId });
    return result.deletedCount > 0;
  }

  async exists(userId: string, whiskeyId: string): Promise<boolean> {
    return !!(await Wishlist.exists({ user: userId, whiskey: whiskeyId }));
  }

  /** The user's wishlist — whisky populated, newest first, paginated. */
  async findByUser(
    userId: string,
    pagination?: WishlistPaginationOptions
  ): Promise<PaginatedResult<IWishlistItem & { whiskey: IWhiskey }>> {
    const page = Math.max(1, pagination?.page ?? 1);
    const limit = Math.min(100, pagination?.limit ?? 20);
    const skip = (page - 1) * limit;

    const query = { user: userId };

    const [data, total] = await Promise.all([
      Wishlist.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("whiskey")
        .lean() as unknown as Promise<(IWishlistItem & { whiskey: IWhiskey })[]>,
      Wishlist.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const wishlistRepository = new WishlistRepository();
