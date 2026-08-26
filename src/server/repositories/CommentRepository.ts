/**
 * @file CommentRepository.ts
 * @description The MongoDB access layer for tasting note comments.
 */

import mongoose from "mongoose";
import Comment, { IComment } from "../models/Comment";
import { ACTIVE_AUTHOR_STAGES } from "./active-author";

export class CommentRepository {
  async create(userId: string, noteId: string, body: string): Promise<IComment> {
    const comment = new Comment({ user: userId, tastingNote: noteId, body });
    const saved = await comment.save();
    return saved.toObject() as unknown as IComment;
  }

  /** Fetches a comment with its author (for the permission check and the DTO). */
  async findById(id: string): Promise<IComment | null> {
    return await Comment.findById(id).lean() as unknown as IComment | null;
  }

  /**
   * A note's comments, oldest first, with the author populated.
   *
   * Comments by authors who closed their account are dropped. `populate` does
   * not filter the parent document, so `closedAt` is selected as well and the
   * filtering happens here; the field never reaches the DTO (see
   * toCommentDTO). The query is not paginated, so filtering after populate
   * does not disturb any counts.
   */
  async findByNote(noteId: string): Promise<IComment[]> {
    const comments = await Comment.find({ tastingNote: noteId })
      .sort({ createdAt: 1 })
      .populate("user", "name profilePicture closedAt")
      .lean() as unknown as (IComment & { user?: { closedAt?: Date } | null })[];

    return comments.filter((c) => c.user && !c.user.closedAt) as unknown as IComment[];
  }

  async countByNote(noteId: string): Promise<number> {
    return (await this.countByNotes([noteId])).get(noteId) ?? 0;
  }

  /**
   * Returns the comment counts for several notes in one aggregate (avoiding
   * N+1). Comments from closed accounts are not counted — the number has to
   * agree with the list shown.
   */
  async countByNotes(noteIds: string[]): Promise<Map<string, number>> {
    if (noteIds.length === 0) return new Map();

    const objectIds = noteIds.map((id) => new mongoose.Types.ObjectId(id));

    const rows = await Comment.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { tastingNote: { $in: objectIds } } },
      ...ACTIVE_AUTHOR_STAGES,
      { $group: { _id: "$tastingNote", count: { $sum: 1 } } },
    ]);

    return new Map(rows.map((r) => [String(r._id), r.count]));
  }

  async delete(id: string): Promise<boolean> {
    const result = await Comment.findByIdAndDelete(id);
    return result !== null;
  }

  /** Clears a note's comments when the note is deleted. */
  async deleteByNote(noteId: string): Promise<number> {
    const result = await Comment.deleteMany({ tastingNote: noteId });
    return result.deletedCount;
  }
}

export const commentRepository = new CommentRepository();
