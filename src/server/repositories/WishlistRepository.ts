/**
 * @file WishlistRepository.ts
 * @description İstek listesi için MongoDB erişim katmanı.
 */

import Wishlist, { IWishlistItem } from "../models/Wishlist";
import type { PaginatedResult } from "./WhiskeyRepository";
import type { IWhiskey } from "../models/Whiskey";

export interface WishlistPaginationOptions {
  page?: number;
  limit?: number;
}

export class WishlistRepository {
  /** Ekler. Zaten varsa idempotent davranır; yeni kayıt oluştuysa true döner. */
  async add(userId: string, whiskeyId: string): Promise<boolean> {
    const result = await Wishlist.updateOne(
      { user: userId, whiskey: whiskeyId },
      { $setOnInsert: { user: userId, whiskey: whiskeyId } },
      { upsert: true }
    );
    return result.upsertedCount > 0;
  }

  /** Kaldırır. Silinen kayıt varsa true döner. */
  async remove(userId: string, whiskeyId: string): Promise<boolean> {
    const result = await Wishlist.deleteOne({ user: userId, whiskey: whiskeyId });
    return result.deletedCount > 0;
  }

  async exists(userId: string, whiskeyId: string): Promise<boolean> {
    return !!(await Wishlist.exists({ user: userId, whiskey: whiskeyId }));
  }

  /** Kullanıcının istek listesi — viski bilgisi populate edilmiş, en yeni önce, sayfalı */
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
