import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * A comment written on a tasting note.
 * Comments can only be written on public notes — the rule lives in the service
 * layer.
 */
export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  tastingNote: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tastingNote: { type: Schema.Types.ObjectId, ref: "TastingNote", required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// For fetching a note's comments in chronological order
CommentSchema.index({ tastingNote: 1, createdAt: 1 });

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
