/**
 * @file LikeRepository.ts
 * @description Tadım notu beğenileri için MongoDB erişim katmanı.
 */

import mongoose from "mongoose";
import Like, { ILike } from "../models/Like";
import { ACTIVE_AUTHOR_STAGES } from "./active-author";

export class LikeRepository {
  /** Beğeni ekler. Zaten varsa idempotent davranır; yeni kayıt oluştuysa true döner. */
  async create(userId: string, noteId: string): Promise<boolean> {
    const result = await Like.updateOne(
      { user: userId, tastingNote: noteId },
      { $setOnInsert: { user: userId, tastingNote: noteId } },
      { upsert: true }
    );
    return result.upsertedCount > 0;
  }

  /** Beğeniyi kaldırır. Silinen kayıt varsa true döner. */
  async delete(userId: string, noteId: string): Promise<boolean> {
    const result = await Like.deleteOne({ user: userId, tastingNote: noteId });
    return result.deletedCount > 0;
  }

  async exists(userId: string, noteId: string): Promise<boolean> {
    return !!(await Like.exists({ user: userId, tastingNote: noteId }));
  }

  async countByNote(noteId: string): Promise<number> {
    return (await this.countByNotes([noteId])).get(noteId) ?? 0;
  }

  /**
   * Birden çok notun beğeni sayısını tek aggregate ile döndürür.
   * Liste ekranlarında not başına ayrı sayım yapmamak içindir (N+1 önlenir).
   * Hesabını kapatmış kullanıcıların beğenileri sayılmaz.
   */
  async countByNotes(noteIds: string[]): Promise<Map<string, number>> {
    if (noteIds.length === 0) return new Map();

    const objectIds = noteIds.map((id) => new mongoose.Types.ObjectId(id));

    const rows = await Like.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { tastingNote: { $in: objectIds } } },
      ...ACTIVE_AUTHOR_STAGES,
      { $group: { _id: "$tastingNote", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((r) => [String(r._id), r.count]));
  }

  /**
   * Verilen notlardan kullanıcının beğendiklerinin id kümesi.
   * Liste ekranlarında kalp ikonunu doldurmak için tek sorguda çözülür.
   */
  async findLikedNoteIds(userId: string, noteIds: string[]): Promise<Set<string>> {
    if (noteIds.length === 0) return new Set();

    const docs = await Like.find({ user: userId, tastingNote: { $in: noteIds } })
      .select("tastingNote")
      .lean();

    return new Set((docs as Pick<ILike, "tastingNote">[]).map((d) => String(d.tastingNote)));
  }

  /** Not silindiğinde beğenilerini temizler */
  async deleteByNote(noteId: string): Promise<number> {
    const result = await Like.deleteMany({ tastingNote: noteId });
    return result.deletedCount;
  }
}

export const likeRepository = new LikeRepository();
