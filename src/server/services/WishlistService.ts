/**
 * @file WishlistService.ts
 * @description İstek listesi iş mantığı. Kullanıcının denemeyi düşündüğü
 * viskileri işaretlemesi — envanter/stok yönetimi değildir, yalnızca bir işaret.
 */

import mongoose from "mongoose";
import { wishlistRepository } from "../repositories/WishlistRepository";
import { whiskeyRepository } from "../repositories/WhiskeyRepository";
import { NotFoundError } from "@/lib/errors";
import { toWhiskeyDTO, type WishlistItemDTO } from "@/lib/types/dto";
import type { PaginatedResult } from "../repositories/WhiskeyRepository";

export class WishlistService {
  private assertValidWhiskeyId(whiskeyId: string): void {
    if (!mongoose.Types.ObjectId.isValid(whiskeyId)) {
      throw new NotFoundError("Viski bulunamadı");
    }
  }

  /** İstek listesine ekler. Katalogda gerçekten var olan bir viski olmalı. */
  async add(userId: string, whiskeyId: string): Promise<boolean> {
    this.assertValidWhiskeyId(whiskeyId);

    const whiskey = await whiskeyRepository.findById(whiskeyId);
    if (!whiskey) throw new NotFoundError("Viski bulunamadı");

    return await wishlistRepository.add(userId, whiskeyId);
  }

  async remove(userId: string, whiskeyId: string): Promise<boolean> {
    this.assertValidWhiskeyId(whiskeyId);
    return await wishlistRepository.remove(userId, whiskeyId);
  }

  async isWishlisted(userId: string, whiskeyId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(whiskeyId)) return false;
    return await wishlistRepository.exists(userId, whiskeyId);
  }

  async getWishlist(
    userId: string,
    pagination?: { page?: number; limit?: number }
  ): Promise<PaginatedResult<WishlistItemDTO>> {
    const result = await wishlistRepository.findByUser(userId, pagination);
    return {
      ...result,
      data: result.data.map((item) => ({
        whiskey: toWhiskeyDTO(item.whiskey),
        addedAt: new Date(item.createdAt).toISOString(),
      })),
    };
  }
}

export const wishlistService = new WishlistService();
