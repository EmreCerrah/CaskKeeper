import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * A record of one attempt against the authentication endpoints.
 *
 * Why the database: Vercel runs serverless, so an in-memory counter is useless
 * — each request can land on a different instance, and instances are
 * short-lived. Rather than an external store (Redis/KV), the MongoDB that is
 * already here is used; measured, the extra cost is negligible next to
 * sign-in's own bcrypt cost of roughly 450 ms.
 *
 * The records delete themselves through a TTL index, so no cleanup job is
 * needed.
 */
export interface IAuthAttempt extends Document {
  /** The counter's identity — e.g. "login:ip:1.2.3.4" or "login:ip+email:1.2.3.4|a@b.c" */
  key: string;
  createdAt: Date;
}

/**
 * How long the records live. The window itself is worked out on the query side;
 * this value only decides when the rubbish is collected, and has to be longer
 * than the longest window.
 */
export const AUTH_ATTEMPT_TTL_SECONDS = 60 * 60; // 1 saat

const AuthAttemptSchema = new Schema<IAuthAttempt>({
  key: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

// For counting attempts inside a window: key first, then time.
AuthAttemptSchema.index({ key: 1, createdAt: -1 });

// MongoDB deletes the records itself once they expire.
// CAREFUL: if the index definition changes, `npm run db:indexes` has to be run
// once — Mongoose does not update an existing TTL index's duration on its own.
AuthAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: AUTH_ATTEMPT_TTL_SECONDS });

const AuthAttempt: Model<IAuthAttempt> =
  mongoose.models.AuthAttempt || mongoose.model<IAuthAttempt>("AuthAttempt", AuthAttemptSchema);

export default AuthAttempt;
