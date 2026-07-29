import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Bir kullanıcının başka bir kullanıcıyı takip etmesini temsil eder.
 * follower → following yönlüdür (follower, following'i takip eder).
 */
export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

// Aynı takip ilişkisi yalnızca bir kez var olabilir
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow: Model<IFollow> =
  mongoose.models.Follow || mongoose.model<IFollow>("Follow", FollowSchema);

export default Follow;
