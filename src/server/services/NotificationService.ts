/**
 * @file NotificationService.ts
 * @description Business rules for notifications.
 *
 * Two rules are enforced in this layer:
 *  1. A user is never notified about their own action (liking their own note,
 *     for instance).
 *  2. A notification can only be read or marked by its recipient.
 *
 * Producing a notification must never break the action behind it — a follow, a
 * like, a comment — so `notify` never throws; it logs.
 */

import mongoose from "mongoose";
import {
  notificationRepository,
  type NotificationPaginationOptions,
} from "../repositories/NotificationRepository";
import type { NotificationType } from "../models/Notification";
import { NotFoundError } from "@/lib/errors";
import { toNotificationDTO, type NotificationListDTO } from "@/lib/types/dto";

export interface NotifyInput {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  tastingNoteId?: string;
  commentId?: string;
}

export class NotificationService {
  /**
   * Creates a notification. Does nothing when the recipient and the actor are
   * the same person. Never throws — a notification is a side effect and must
   * not undo the action it accompanies.
   */
  async notify(input: NotifyInput): Promise<void> {
    if (input.recipientId === input.actorId) return;

    try {
      await notificationRepository.create(input);
    } catch (error) {
      console.error("[notification] Could not create the notification:", error);
    }
  }

  /**
   * Deletes the notification for an undone action (unfollowing, unliking), so
   * the list stops showing events that no longer hold.
   */
  async revoke(input: NotifyInput): Promise<void> {
    if (input.recipientId === input.actorId) return;

    try {
      await notificationRepository.deleteByAction(input);
    } catch (error) {
      console.error("[notification] Bildirim silinemedi:", error);
    }
  }

  async list(
    userId: string,
    pagination?: NotificationPaginationOptions
  ): Promise<NotificationListDTO> {
    const [result, unreadCount] = await Promise.all([
      notificationRepository.findByRecipient(userId, pagination),
      notificationRepository.countUnread(userId),
    ]);

    return {
      ...result,
      data: result.data.map(toNotificationDTO),
      unreadCount,
    };
  }

  async countUnread(userId: string): Promise<number> {
    return await notificationRepository.countUnread(userId);
  }

  /** Marks one notification read. Throws NotFound for somebody else's notification. */
  async markRead(notificationId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      throw new NotFoundError("errors.notificationNotFound");
    }

    const updated = await notificationRepository.markRead(notificationId, userId);
    if (!updated) throw new NotFoundError("errors.notificationNotFound");
  }

  /** Marks all of a user's notifications read; returns how many were marked. */
  async markAllRead(userId: string): Promise<number> {
    return await notificationRepository.markAllRead(userId);
  }
}

export const notificationService = new NotificationService();
