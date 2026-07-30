import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Bir kullanıcının denemeyi düşündüğü viski.
 * Bilinçli olarak sade tutulur — miktar, fiyat, konum gibi envanter alanları
 * yoktur (ürün brief'i: "envanter/stok yönetimi değil").
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

// Bir viski, bir kullanıcının istek listesinde yalnızca bir kez olabilir
WishlistSchema.index({ user: 1, whiskey: 1 }, { unique: true });

const Wishlist: Model<IWishlistItem> =
  mongoose.models.Wishlist || mongoose.model<IWishlistItem>("Wishlist", WishlistSchema);

export default Wishlist;
