/**
 * @file NotificationRepository.ts
 * @description Bildirimler için MongoDB erişim katmanı.
 * Tüm sorgular alıcı (recipient) bazlıdır — bir kullanıcının bildirimi
 * başka kullanıcıya sızmaz.
 */

import Notification, { INotification, NotificationType } from "../models/Notification";
import type { PaginatedResult } from "./WhiskeyRepository";

export interface CreateNotificationInput {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  tastingNoteId?: string;
  commentId?: string;
}

export interface NotificationPaginationOptions {
  page?: number;
  limit?: number;
}

export class NotificationRepository {
  async create(input: CreateNotificationInput): Promise<INotification> {
    const notification = new Notification({
      recipient: input.recipientId,
      actor: input.actorId,
      type: input.type,
      tastingNote: input.tastingNoteId,
      comment: input.commentId,
    });
    const saved = await notification.save();
    return saved.toObject() as unknown as INotification;
  }

  /**
   * Bildirim listesi — en yeni önce. Eyleyen kullanıcı, ilgili tadım notu
   * (viski adı için) ve yorum metni tek turda populate edilir.
   */
  async findByRecipient(
    recipientId: string,
    pagination?: NotificationPaginationOptions
  ): Promise<PaginatedResult<INotification>> {
    const page = Math.max(1, pagination?.page ?? 1);
    const limit = Math.min(100, pagination?.limit ?? 20);
    const skip = (page - 1) * limit;

    const query = { recipient: recipientId };

    const [data, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("actor", "name profilePicture")
        .populate({ path: "tastingNote", select: "whiskey", populate: { path: "whiskey", select: "brand name slug" } })
        .populate("comment", "body")
        .lean() as unknown as Promise<INotification[]>,
      Notification.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async countUnread(recipientId: string): Promise<number> {
    return await Notification.countDocuments({ recipient: recipientId, isRead: false });
  }

  async findById(id: string): Promise<INotification | null> {
    return await Notification.findById(id).lean() as unknown as INotification | null;
  }

  /** Tek bildirimi okundu işaretler; yalnızca alıcısı için geçerlidir. */
  async markRead(id: string, recipientId: string): Promise<boolean> {
    const result = await Notification.updateOne(
      { _id: id, recipient: recipientId },
      { $set: { isRead: true } }
    );
    return result.matchedCount > 0;
  }

  /** Kullanıcının tüm okunmamış bildirimlerini okundu işaretler; sayıyı döner. */
  async markAllRead(recipientId: string): Promise<number> {
    const result = await Notification.updateMany(
      { recipient: recipientId, isRead: false },
      { $set: { isRead: true } }
    );
    return result.modifiedCount;
  }

  /**
   * Geri alınan bir eylemin bildirimini siler (takibi bırakma, beğeniyi kaldırma).
   * tastingNoteId verilmezse yalnızca eyleyen + tür eşleşmesine bakılır.
   */
  async deleteByAction(input: {
    recipientId: string;
    actorId: string;
    type: NotificationType;
    tastingNoteId?: string;
    commentId?: string;
  }): Promise<number> {
    const query: Record<string, unknown> = {
      recipient: input.recipientId,
      actor: input.actorId,
      type: input.type,
    };
    if (input.tastingNoteId) query.tastingNote = input.tastingNoteId;
    if (input.commentId) query.comment = input.commentId;

    const result = await Notification.deleteMany(query);
    return result.deletedCount;
  }

  /** Not silindiğinde ona bağlı bildirimleri temizler */
  async deleteByNote(noteId: string): Promise<number> {
    const result = await Notification.deleteMany({ tastingNote: noteId });
    return result.deletedCount;
  }

  /** Yorum silindiğinde ona bağlı bildirimi temizler */
  async deleteByComment(commentId: string): Promise<number> {
    const result = await Notification.deleteMany({ comment: commentId });
    return result.deletedCount;
  }
}

export const notificationRepository = new NotificationRepository();
