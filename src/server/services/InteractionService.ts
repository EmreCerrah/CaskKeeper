/**
 * @file InteractionService.ts
 * @description Business rules for likes and comments on tasting notes.
 *
 * The invariant: interaction is only possible with **public** notes. Private
 * notes are personal — nobody else should even learn that one exists, which is
 * why a private note also returns NotFound.
 */

import mongoose from "mongoose";
import { likeRepository } from "../repositories/LikeRepository";
import { commentRepository } from "../repositories/CommentRepository";
import { notificationRepository } from "../repositories/NotificationRepository";
import { tastingNoteRepository } from "../repositories/TastingNoteRepository";
import { notificationService } from "./NotificationService";
import { CreateCommentSchema } from "../validations/comment.schema";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { TranslationKey } from "@/lib/i18n/translate";
import { toCommentDTO, type CommentDTO, type NoteInteractionsDTO } from "@/lib/types/dto";
import type { ITastingNote } from "../models/TastingNote";

export class InteractionService {
  // ---------- Shared guards ----------

  private assertValidId(id: string, messageKey: TranslationKey): void {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError(messageKey);
    }
  }

  /**
   * Returns a note that is open to interaction (likes/comments).
   * Throws NotFound when the note is missing or is not public.
   */
  private async getInteractableNote(noteId: string): Promise<ITastingNote> {
    this.assertValidId(noteId, "errors.tastingNoteNotFound");

    const note = await tastingNoteRepository.findById(noteId);
    if (!note || note.visibility !== "public") {
      throw new NotFoundError("errors.tastingNoteNotFound");
    }
    return note;
  }

  /**
   * Returns a readable note: one that is public, or the requester's own.
   * Used for listing comments.
   */
  private async getReadableNote(noteId: string, viewerId?: string): Promise<ITastingNote> {
    this.assertValidId(noteId, "errors.tastingNoteNotFound");

    const note = await tastingNoteRepository.findById(noteId);
    if (!note) throw new NotFoundError("errors.tastingNoteNotFound");

    const isOwner = viewerId !== undefined && String(note.user) === viewerId;
    if (note.visibility !== "public" && !isOwner) {
      throw new NotFoundError("errors.tastingNoteNotFound");
    }
    return note;
  }

  // ---------- Likes ----------

  /** Likes a note. Produces no second notification if it was already liked. */
  async like(userId: string, noteId: string): Promise<NoteInteractionsDTO> {
    const note = await this.getInteractableNote(noteId);

    const isNew = await likeRepository.create(userId, noteId);

    if (isNew) {
      await notificationService.notify({
        recipientId: String(note.user),
        actorId: userId,
        type: "like",
        tastingNoteId: noteId,
      });
    }

    return await this.getInteractionsForNote(noteId, userId);
  }

  /** Removes the like and deletes the matching notification. */
  async unlike(userId: string, noteId: string): Promise<NoteInteractionsDTO> {
    const note = await this.getInteractableNote(noteId);

    const removed = await likeRepository.delete(userId, noteId);

    if (removed) {
      await notificationService.revoke({
        recipientId: String(note.user),
        actorId: userId,
        type: "like",
        tastingNoteId: noteId,
      });
    }

    return await this.getInteractionsForNote(noteId, userId);
  }

  // ---------- Comments ----------

  async getComments(noteId: string, viewerId?: string): Promise<CommentDTO[]> {
    const note = await this.getReadableNote(noteId, viewerId);
    const isNoteOwner = viewerId !== undefined && String(note.user) === viewerId;

    const comments = await commentRepository.findByNote(noteId);

    return comments.map((comment) => {
      const authorId = this.resolveAuthorId(comment.user);
      const canDelete = viewerId !== undefined && (isNoteOwner || authorId === viewerId);
      return toCommentDTO(comment, canDelete);
    });
  }

  async addComment(userId: string, noteId: string, data: unknown): Promise<CommentDTO> {
    const parsed = CreateCommentSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("errors.invalidComment", parsed.error.flatten().fieldErrors);
    }

    const note = await this.getInteractableNote(noteId);

    const comment = await commentRepository.create(userId, noteId, parsed.data.body);

    await notificationService.notify({
      recipientId: String(note.user),
      actorId: userId,
      type: "comment",
      tastingNoteId: noteId,
      commentId: String(comment._id),
    });

    // The new comment is shown on the card straight away; the author has not
    // been populated yet
    const created = await commentRepository.findByNote(noteId);
    const saved = created.find((c) => String(c._id) === String(comment._id));

    return toCommentDTO(saved ?? comment, true);
  }

  /**
   * Deletes a comment. Either its author or the note's owner may do so — the
   * owner being able to remove comments from their own note is a deliberate
   * decision.
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    this.assertValidId(commentId, "errors.commentNotFound");

    const comment = await commentRepository.findById(commentId);
    if (!comment) throw new NotFoundError("errors.commentNotFound");

    const isAuthor = this.resolveAuthorId(comment.user) === userId;

    let isNoteOwner = false;
    if (!isAuthor) {
      const note = await tastingNoteRepository.findById(String(comment.tastingNote));
      isNoteOwner = note !== null && String(note.user) === userId;
    }

    if (!isAuthor && !isNoteOwner) {
      throw new ForbiddenError("errors.commentDeleteForbidden");
    }

    await commentRepository.delete(commentId);
    await notificationRepository.deleteByComment(commentId);
  }

  // ---------- Interaction summary ----------

  /** The like/comment summary for a single note. */
  async getInteractionsForNote(noteId: string, viewerId?: string): Promise<NoteInteractionsDTO> {
    const summary = await this.getInteractionsFor([noteId], viewerId);
    return summary.get(noteId) ?? { likeCount: 0, commentCount: 0, isLikedByViewer: false };
  }

  /**
   * Fetches the interaction summary for several notes at once — list screens
   * do not fire a query per note (avoiding N+1).
   */
  async getInteractionsFor(
    noteIds: string[],
    viewerId?: string
  ): Promise<Map<string, NoteInteractionsDTO>> {
    if (noteIds.length === 0) return new Map();

    const [likeCounts, commentCounts, likedIds] = await Promise.all([
      likeRepository.countByNotes(noteIds),
      commentRepository.countByNotes(noteIds),
      viewerId
        ? likeRepository.findLikedNoteIds(viewerId, noteIds)
        : Promise.resolve(new Set<string>()),
    ]);

    return new Map(
      noteIds.map((id) => [
        id,
        {
          likeCount: likeCounts.get(id) ?? 0,
          commentCount: commentCounts.get(id) ?? 0,
          isLikedByViewer: likedIds.has(id),
        },
      ])
    );
  }

  /** Clears a note's likes, comments and notifications when it is deleted. */
  async removeNoteInteractions(noteId: string): Promise<void> {
    await Promise.all([
      likeRepository.deleteByNote(noteId),
      commentRepository.deleteByNote(noteId),
      notificationRepository.deleteByNote(noteId),
    ]);
  }

  /** A comment's `user` field may be a populated object or an ObjectId. */
  private resolveAuthorId(user: unknown): string {
    if (user !== null && typeof user === "object" && "_id" in (user as Record<string, unknown>)) {
      return String((user as { _id: unknown })._id);
    }
    return String(user);
  }
}

export const interactionService = new InteractionService();
