/**
 * @file InteractionService.ts
 * @description Tadım notlarına beğeni ve yorum iş mantığı.
 *
 * Değişmez kural: etkileşim yalnızca **herkese açık** notlara verilebilir.
 * Özel (private) notlar kişiseldir — başkası varlığını dahi öğrenmemeli,
 * bu yüzden özel notlar için de NotFound döner.
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
  // ---------- Ortak korumalar ----------

  private assertValidId(id: string, messageKey: TranslationKey): void {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError(messageKey);
    }
  }

  /**
   * Etkileşime (beğeni/yorum) açık notu döndürür.
   * Not yoksa ya da herkese açık değilse NotFound fırlatır.
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
   * Okunabilir notu döndürür: herkese açık olan ya da isteği yapanın kendi notu.
   * Yorumları listelemek için kullanılır.
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

  // ---------- Beğeni ----------

  /** Notu beğenir. Zaten beğenilmişse tekrar bildirim üretmez. */
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

  /** Beğeniyi kaldırır ve ilgili bildirimi siler. */
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

  // ---------- Yorum ----------

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

    // Yeni yorum kartta hemen gösterilir; yazar bilgisi henüz populate edilmedi
    const created = await commentRepository.findByNote(noteId);
    const saved = created.find((c) => String(c._id) === String(comment._id));

    return toCommentDTO(saved ?? comment, true);
  }

  /**
   * Yorumu siler. Yorumun yazarı ya da notun sahibi silebilir —
   * not sahibinin kendi notundaki yorumları kaldırabilmesi bilinçli bir karardır.
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

  // ---------- Etkileşim özeti ----------

  /** Tek bir notun beğeni/yorum özeti */
  async getInteractionsForNote(noteId: string, viewerId?: string): Promise<NoteInteractionsDTO> {
    const summary = await this.getInteractionsFor([noteId], viewerId);
    return summary.get(noteId) ?? { likeCount: 0, commentCount: 0, isLikedByViewer: false };
  }

  /**
   * Birden çok notun etkileşim özetini toplu çeker — liste ekranlarında
   * not başına ayrı sorgu atılmaz (N+1 önlenir).
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

  /** Not silindiğinde beğeni, yorum ve bildirimlerini temizler. */
  async removeNoteInteractions(noteId: string): Promise<void> {
    await Promise.all([
      likeRepository.deleteByNote(noteId),
      commentRepository.deleteByNote(noteId),
      notificationRepository.deleteByNote(noteId),
    ]);
  }

  /** Yorumun `user` alanı populate edilmiş obje ya da ObjectId olabilir. */
  private resolveAuthorId(user: unknown): string {
    if (user !== null && typeof user === "object" && "_id" in (user as Record<string, unknown>)) {
      return String((user as { _id: unknown })._id);
    }
    return String(user);
  }
}

export const interactionService = new InteractionService();
