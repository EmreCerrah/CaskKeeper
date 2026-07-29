import mongoose, { Schema, Document, Model } from "mongoose";

export type FinishLength = "short" | "medium" | "long";
export type Visibility = "private" | "public";

export interface ITastingNote extends Document {
  user: mongoose.Types.ObjectId;
  whiskey: mongoose.Types.ObjectId;

  /** Tadım seansının tarihi (not oluşturma tarihinden bağımsız) */
  tastingDate: Date;

  rating: number; // 0 to 100

  noseTags: string[];
  noseNotes?: string;

  palateTags: string[];
  palateNotes?: string;

  finishTags: string[];
  finishNotes?: string;
  finishLength: FinishLength;

  personalNotes?: string;
  visibility: Visibility;
  isFavorite: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const TastingNoteSchema = new Schema<ITastingNote>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    whiskey: { type: Schema.Types.ObjectId, ref: "Whiskey", required: true, index: true },

    tastingDate: { type: Date, required: true, default: Date.now },

    rating: { type: Number, required: true, min: 0, max: 100 },

    noseTags: [{ type: String }],
    noseNotes: { type: String, maxlength: 1000 },

    palateTags: [{ type: String }],
    palateNotes: { type: String, maxlength: 1000 },

    finishTags: [{ type: String }],
    finishNotes: { type: String, maxlength: 1000 },
    finishLength: { type: String, enum: ["short", "medium", "long"], required: true },

    personalNotes: { type: String, maxlength: 2000 },
    visibility: { type: String, enum: ["private", "public"], default: "private", index: true },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexing for fetching user's notes for a specific whiskey efficiently
TastingNoteSchema.index({ user: 1, whiskey: 1 });
// Indexing for public feeds
TastingNoteSchema.index({ visibility: 1, createdAt: -1 });
// Kullanıcının favorileri için
TastingNoteSchema.index({ user: 1, isFavorite: 1 });

const TastingNote: Model<ITastingNote> = mongoose.models.TastingNote || mongoose.model<ITastingNote>("TastingNote", TastingNoteSchema);

export default TastingNote;
