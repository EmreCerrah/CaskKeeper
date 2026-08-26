import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * One user liking one tasting note.
 * Likes can only be given to public notes — the rule lives in the service
 * layer.
 */
export interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  tastingNote: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tastingNote: { type: Schema.Types.ObjectId, ref: "TastingNote", required: true, index: true },
  },
  { timestamps: true }
);

// A user can like the same note only once
LikeSchema.index({ user: 1, tastingNote: 1 }, { unique: true });

const Like: Model<ILike> = mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);

export default Like;
