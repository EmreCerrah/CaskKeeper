/**
 * @file NotificationService.ts
 * @description Bildirim iş mantığı.
 *
 * İki kural bu katmanda zorunlu kılınır:
 *  1. Kullanıcı kendi eylemi için bildirim almaz (kendi notunu beğenmek gibi).
 *  2. Bildirim yalnızca alıcısı tarafından okunabilir/işaretlenebilir.
 *
 * Bildirim üretimi hiçbir zaman asıl işlemi (takip, beğeni, yorum) bozmamalıdır;
 * bu yüzden `notify` çağrıları hata fırlatmaz, yalnızca loglar.
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
   * Bildirim oluşturur. Alıcı ile eyleyen aynı kişiyse hiçbir şey yapmaz.
   * Hata fırlatmaz — bildirim yan etkidir, asıl işlemi geri almamalıdır.
   */
  async notify(input: NotifyInput): Promise<void> {
    if (input.recipientId === input.actorId) return;

    try {
      await notificationRepository.create(input);
    } catch (error) {
      console.error("[notification] Bildirim oluşturulamadı:", error);
    }
  }

  /**
   * Geri alınan bir eylemin bildirimini siler (takibi bırakma, beğeniyi kaldırma).
   * Böylece bildirim listesi artık geçerli olmayan olayları göstermez.
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

  /** Tek bildirimi okundu işaretler. Başkasının bildirimi için NotFound fırlatır. */
  async markRead(notificationId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      throw new NotFoundError("errors.notificationNotFound");
    }

    const updated = await notificationRepository.markRead(notificationId, userId);
    if (!updated) throw new NotFoundError("errors.notificationNotFound");
  }

  /** Kullanıcının tüm bildirimlerini okundu işaretler; işaretlenen sayıyı döner. */
  async markAllRead(userId: string): Promise<number> {
    return await notificationRepository.markAllRead(userId);
  }
}

export const notificationService = new NotificationService();
