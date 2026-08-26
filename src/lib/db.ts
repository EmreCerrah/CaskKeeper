import mongoose from "mongoose";

/**
 * @file db.ts
 * @description The MongoDB connection, and validating the connection string.
 *
 * The checks live inside `connectToDatabase()` DELIBERATELY, not at module
 * level. Throwing at module level meant `next build` could not start at all
 * without the environment variable, because fifty files import `db.ts` — even
 * though the build never connects to the database (every page that fetches data
 * is `force-dynamic`). The Dockerfile and CI had to carry a fake connection
 * string just for that.
 */

/** So it cannot leak to the client: the credentials in the string are masked in error messages. */
function maskCredentials(uri: string): string {
  return uri.replace(/\/\/[^@]*@/, "//***:***@");
}

/**
 * Extracts the database name from the connection string.
 *
 * `new URL()` is NOT used: replica set strings separate several hosts with
 * commas (`mongodb://host1:27017,host2:27017/db`), and the WHATWG URL parser
 * rejects that as invalid and throws.
 */
export function extractDatabaseName(uri: string): string {
  const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//i, "");
  // When credentials are present, the host section starts after the last '@'.
  const afterCredentials = withoutScheme.slice(withoutScheme.lastIndexOf("@") + 1);
  const pathStart = afterCredentials.indexOf("/");
  if (pathStart === -1) return "";
  return afterCredentials.slice(pathStart + 1).split("?")[0];
}

/**
 * Validates the environment variable and returns the connection string.
 *
 * Called before connecting; errors are thrown explicitly so they do not pass
 * silently.
 */
export function resolveConnectionString(uri = process.env.MONGODB_URI): string {
  if (!uri) {
    throw new Error(
      "MONGODB_URI ortam değişkeni tanımlı değil. .env.local dosyanıza ekleyin."
    );
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    throw new Error(
      `MONGODB_URI 'mongodb://' veya 'mongodb+srv://' ile başlamalı: ${maskCredentials(uri)}`
    );
  }

  if (!extractDatabaseName(uri)) {
    throw new Error(
      "MONGODB_URI veritabanı adı içermiyor " +
        "(ör. mongodb+srv://…mongodb.net/caskkeeper). Ad verilmezse Mongoose " +
        "sessizce 'test' veritabanına yazar — Atlas'a ilk geçişte veriler tam " +
        "bu yüzden yanlış veritabanına gitmişti."
    );
  }

  return uri;
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(resolveConnectionString(), {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Do not keep a failed attempt: otherwise every request after the first
    // error receives the same rejected promise and the connection is never
    // retried.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
