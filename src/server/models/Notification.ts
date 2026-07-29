import mongoose, { Schema, Document, Model } from "mongoose";

/** Bildirim türleri — her biri farklı bir hedefe yönlendirir. */
export type NotificationType = "follow" | "like" | "comment";

export const NOTIFICATION_TYPES: NotificationType[] = ["follow", "like", "comment"];

/**
 * Bir kullanıcıya (recipient) başka bir kullanıcının (actor) eylemi hakkında
 * gönderilen bildirim. Eylem geri alındığında (takibi bırakma, beğeniyi kaldırma,
 * yorumu silme) ilgili bildirim de silinir — böylece bildirim listesi gerçeği yansıtır.
 */
export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId;
  type: NotificationType;
  /** like/comment bildirimlerinde ilgili tadım notu */
  tastingNote?: mongoose.Types.ObjectId;
  /** comment bildirimlerinde ilgili yorum */
  comment?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    tastingNote: { type: Schema.Types.ObjectId, ref: "TastingNote" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Bildirim listesi: alıcıya ait, en yeni önce
NotificationSchema.index({ recipient: 1, createdAt: -1 });
// Okunmamış rozeti sayımı
NotificationSchema.index({ recipient: 1, isRead: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
