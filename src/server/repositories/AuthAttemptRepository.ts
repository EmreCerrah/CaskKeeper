/**
 * @file AuthAttemptRepository.ts
 * @description The MongoDB access layer for authentication attempts.
 */

import AuthAttempt from "../models/AuthAttempt";

export class AuthAttemptRepository {
  /** Records an attempt. */
  async record(key: string, at: Date = new Date()): Promise<void> {
    await AuthAttempt.create({ key, createdAt: at });
  }

  /** Counts the attempts made since the given moment. */
  async countSince(key: string, since: Date): Promise<number> {
    return AuthAttempt.countDocuments({ key, createdAt: { $gte: since } });
  }

  /** Resets that key's counter after a successful sign-in. */
  async clear(key: string): Promise<void> {
    await AuthAttempt.deleteMany({ key });
  }
}

export const authAttemptRepository = new AuthAttemptRepository();
