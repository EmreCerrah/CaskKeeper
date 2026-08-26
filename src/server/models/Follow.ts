import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Represents one user following another.
 * It is directional, follower → following (the follower follows the
 * following).
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

// The same follow relationship can exist only once
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow: Model<IFollow> =
  mongoose.models.Follow || mongoose.model<IFollow>("Follow", FollowSchema);

export default Follow;
