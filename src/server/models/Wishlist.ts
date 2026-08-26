import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * A whisky a user intends to try.
 * Kept deliberately plain — there are no inventory fields such as quantity,
 * price or location (the product brief: "not inventory or stock management").
 */
export interface IWishlistItem extends Document {
  user: mongoose.Types.ObjectId;
  whiskey: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlistItem>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    whiskey: { type: Schema.Types.ObjectId, ref: "Whiskey", required: true, index: true },
  },
  { timestamps: true }
);

// A whisky can appear on a user's wishlist only once
WishlistSchema.index({ user: 1, whiskey: 1 }, { unique: true });

const Wishlist: Model<IWishlistItem> =
  mongoose.models.Wishlist || mongoose.model<IWishlistItem>("Wishlist", WishlistSchema);

export default Wishlist;
