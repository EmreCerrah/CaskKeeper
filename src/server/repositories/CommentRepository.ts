/**
 * @file CommentRepository.ts
 * @description Tadım notu yorumları için MongoDB erişim katmanı.
 */

import mongoose from "mongoose";
import Comment, { IComment } from "../models/Comment";

export class CommentRepository {
  async create(userId: string, noteId: string, body: string): Promise<IComment> {
    const comment = new Comment({ user: userId, tastingNote: noteId, body });
    const saved = await comment.save();
    return saved.toObject() as unknown as IComment;
  }

  /** Yorumu yazarıyla birlikte getirir (yetki kontrolü ve DTO için) */
  async findById(id: string): Promise<IComment | null> {
    return await Comment.findById(id).lean() as unknown as IComment | null;
  }

  /** Bir notun yorumları, eskiden yeniye, yazar bilgisi populate edilmiş */
  async findByNote(noteId: string): Promise<IComment[]> {
    return await Comment.find({ tastingNote: noteId })
      .sort({ createdAt: 1 })
      .populate("user", "name profilePicture")
      .lean() as unknown as IComment[];
  }

  async countByNote(noteId: string): Promise<number> {
    return await Comment.countDocuments({ tastingNote: noteId });
  }

  /**
   * Birden çok notun yorum sayısını tek aggregate ile döndürür (N+1 önlenir).
   */
  async countByNotes(noteIds: string[]): Promise<Map<string, number>> {
    if (noteIds.length === 0) return new Map();

    const objectIds = noteIds.map((id) => new mongoose.Types.ObjectId(id));

    const rows = await Comment.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { tastingNote: { $in: objectIds } } },
      { $group: { _id: "$tastingNote", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((r) => [String(r._id), r.count]));
  }

  async delete(id: string): Promise<boolean> {
    const result = await Comment.findByIdAndDelete(id);
    return result !== null;
  }

  /** Not silindiğinde yorumlarını temizler */
  async deleteByNote(noteId: string): Promise<number> {
    const result = await Comment.deleteMany({ tastingNote: noteId });
    return result.deletedCount;
  }
}

export const commentRepository = new CommentRepository();
