import mongoose, { Schema, Document, Model } from "mongoose";

/** The notification types — each one leads somewhere different. */
export type NotificationType = "follow" | "like" | "comment";

export const NOTIFICATION_TYPES: NotificationType[] = ["follow", "like", "comment"];

/**
 * A notification sent to one user (the recipient) about another user's action
 * (the actor). When the action is undone — unfollowing, unliking, deleting a
 * comment — the matching notification is deleted too, so the list keeps telling
 * the truth.
 */
export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId;
  type: NotificationType;
  /** The tasting note a like/comment notification refers to. */
  tastingNote?: mongoose.Types.ObjectId;
  /** The comment a comment notification refers to. */
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

// The notification list: belonging to the recipient, newest first
NotificationSchema.index({ recipient: 1, createdAt: -1 });
// Counting for the unread badge
NotificationSchema.index({ recipient: 1, isRead: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
