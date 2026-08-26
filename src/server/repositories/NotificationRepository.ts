/**
 * @file NotificationRepository.ts
 * @description The MongoDB access layer for notifications.
 * Every query is scoped to the recipient — one person's notifications never
 * leak to another.
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
   * The notification list — newest first. The actor, the tasting note it
   * refers to (for the whisky name) and the comment text are all populated in
   * one pass.
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

  /** Marks one notification read; only valid for its recipient. */
  async markRead(id: string, recipientId: string): Promise<boolean> {
    const result = await Notification.updateOne(
      { _id: id, recipient: recipientId },
      { $set: { isRead: true } }
    );
    return result.matchedCount > 0;
  }

  /** Marks all of a user's unread notifications read; returns how many. */
  async markAllRead(recipientId: string): Promise<number> {
    const result = await Notification.updateMany(
      { recipient: recipientId, isRead: false },
      { $set: { isRead: true } }
    );
    return result.modifiedCount;
  }

  /**
   * Deletes the notification for an undone action (unfollowing, unliking).
   * Without a tastingNoteId it matches on actor and type alone.
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

  /** Clears the notifications attached to a note when it is deleted. */
  async deleteByNote(noteId: string): Promise<number> {
    const result = await Notification.deleteMany({ tastingNote: noteId });
    return result.deletedCount;
  }

  /** Clears the notification attached to a comment when it is deleted. */
  async deleteByComment(commentId: string): Promise<number> {
    const result = await Notification.deleteMany({ comment: commentId });
    return result.deletedCount;
  }

  /**
   * Clears the notifications involving a person when their account closes.
   *
   * Where other records are merely hidden, these are DELETED, because a
   * notification is derived, disposable data to begin with: the project already
   * deletes one when a follow or a like is undone (see deleteByAction). A
   * closed account leaving "X started following you" in somebody's inbox would
   * be meaningless when X is no longer visible anywhere.
   *
   * Filtering them at read time was not an option either: the list is
   * paginated, so the totals and page sizes would have been wrong.
   */
  async deleteByUser(userId: string): Promise<number> {
    const result = await Notification.deleteMany({
      $or: [{ actor: userId }, { recipient: userId }],
    });
    return result.deletedCount;
  }
}

export const notificationRepository = new NotificationRepository();
