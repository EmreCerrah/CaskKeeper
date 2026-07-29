import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Bir kullanıcının bir tadım notunu beğenmesi.
 * Beğeni yalnızca herkese açık notlara verilebilir — kural service katmanında.
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

// Bir kullanıcı aynı notu yalnızca bir kez beğenebilir
LikeSchema.index({ user: 1, tastingNote: 1 }, { unique: true });

const Like: Model<ILike> = mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);

export default Like;
