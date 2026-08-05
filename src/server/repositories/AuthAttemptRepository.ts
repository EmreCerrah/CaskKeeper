/**
 * @file AuthAttemptRepository.ts
 * @description Kimlik doğrulama denemelerinin MongoDB erişim katmanı.
 */

import AuthAttempt from "../models/AuthAttempt";

export class AuthAttemptRepository {
  /** Bir denemeyi kaydeder. */
  async record(key: string, at: Date = new Date()): Promise<void> {
    await AuthAttempt.create({ key, createdAt: at });
  }

  /** Verilen andan sonraki denemeleri sayar. */
  async countSince(key: string, since: Date): Promise<number> {
    return AuthAttempt.countDocuments({ key, createdAt: { $gte: since } });
  }

  /** Başarılı girişten sonra o anahtarın sayacını sıfırlar. */
  async clear(key: string): Promise<void> {
    await AuthAttempt.deleteMany({ key });
  }
}

export const authAttemptRepository = new AuthAttemptRepository();
