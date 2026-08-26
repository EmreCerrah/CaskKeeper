/**
 * @file LikeRepository.ts
 * @description The MongoDB access layer for tasting note likes.
 */

import mongoose from "mongoose";
import Like, { ILike } from "../models/Like";
import { ACTIVE_AUTHOR_STAGES } from "./active-author";

export class LikeRepository {
  /** Adds a like. Idempotent if one exists; returns true when a record was created. */
  async create(userId: string, noteId: string): Promise<boolean> {
    const result = await Like.updateOne(
      { user: userId, tastingNote: noteId },
      { $setOnInsert: { user: userId, tastingNote: noteId } },
      { upsert: true }
    );
    return result.upsertedCount > 0;
  }

  /** Removes a like. Returns true when a record was actually deleted. */
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
   * Returns the like counts for several notes in one aggregate.
   * It exists so list screens do not count per note (avoiding N+1).
   * Likes from users who closed their account are not counted.
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
   * The set of ids, among the given notes, that this user has liked.
   * Resolved in a single query so list screens can fill in the heart icon.
   */
  async findLikedNoteIds(userId: string, noteIds: string[]): Promise<Set<string>> {
    if (noteIds.length === 0) return new Set();

    const docs = await Like.find({ user: userId, tastingNote: { $in: noteIds } })
      .select("tastingNote")
      .lean();

    return new Set((docs as Pick<ILike, "tastingNote">[]).map((d) => String(d.tastingNote)));
  }

  /** Clears a note's likes when the note is deleted. */
  async deleteByNote(noteId: string): Promise<number> {
    const result = await Like.deleteMany({ tastingNote: noteId });
    return result.deletedCount;
  }
}

export const likeRepository = new LikeRepository();
