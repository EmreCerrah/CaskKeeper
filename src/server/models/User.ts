import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  /** bcrypt hash — a plaintext password is never stored and never reaches a DTO */
  passwordHash: string;
  profilePicture?: string;
  bio?: string;
  role: "user" | "admin";
  /**
   * When the account was closed. Its PRESENCE means closed — there is no
   * separate `status` field, because two fields can disagree with each other.
   *
   * Records are not deleted: tasting notes, comments written on other people's
   * notes, follows and notifications all reference a User, and really deleting
   * would break other people's data. Visibility is switched off by the active
   * filter in UserRepository.
   *
   * Closing is REVERSIBLE: registering again with the same email reopens this
   * row with a new password and brings its history back (AuthService.register →
   * UserRepository.reopen). The address is never verified, so this means
   * whoever knows it can take over that history — a product decision accepted
   * knowingly. Privilege is not taken over; a reopened account returns as
   * "user".
   */
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    profilePicture: { type: String, required: false, trim: true },
    bio: { type: String, required: false, trim: true, maxlength: 500 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    closedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

/**
 * Email uniqueness applies ONLY to open accounts.
 *
 * Re-registration no longer CREATES a new row; it reopens the closed one, so
 * two rows for the same address are no longer produced. The index stays
 * compound all the same: accounts that closed and re-registered before that
 * change already have two rows, and a single-field `{email}` index could not be
 * built over them.
 *
 * Why a compound index rather than a partial one: MongoDB does NOT ACCEPT
 * `$exists: false` inside `partialFilterExpression` (it turns into `$not`
 * internally, which is unsupported) — it was tried and returned
 * `CannotCreateIndex`. A field like `status: "active"` would have worked, but
 * needed a backfill of the existing records.
 *
 * The compound index needs neither: a missing field indexes as null, so every
 * OPEN account takes the key `(email, null)` and no second open account can
 * share an address. Closed accounts carry `(email, date)` and do not collide.
 *
 * `email` comes first, so queries by email keep using the index.
 *
 * The index definition changed, so run `npm run db:indexes` once after
 * deploying.
 */
UserSchema.index({ email: 1, closedAt: 1 }, { unique: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
