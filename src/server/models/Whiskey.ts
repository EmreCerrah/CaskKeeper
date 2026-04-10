import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWhiskey extends Document {
  brand: string;
  name: string;
  type: string;
  region: string;
  abv: number;
  createdAt: Date;
}

const WhiskeySchema = new Schema<IWhiskey>({
  brand: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true }, // Single Malt, Bourbon, Blend vb.
  region: { type: String, required: true },
  abv: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Next.js Hot Reloading fix
const Whiskey: Model<IWhiskey> = mongoose.models.Whiskey || mongoose.model<IWhiskey>("Whiskey", WhiskeySchema);

export default Whiskey;
