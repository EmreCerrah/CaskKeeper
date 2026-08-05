import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Kimlik doğrulama uçlarına yapılan bir deneme kaydı.
 *
 * Neden veritabanı: Vercel sunucusuz çalıştığı için bellek içi sayaç işe
 * yaramaz — her istek başka bir örneğe düşebilir ve örnekler kısa ömürlüdür.
 * Harici bir store (Redis/KV) yerine zaten var olan MongoDB kullanılıyor;
 * ölçüldüğünde ek maliyetin, girişin kendi bcrypt maliyeti (~450 ms) yanında
 * ihmal edilebilir olduğu görüldü.
 *
 * Kayıtlar TTL index ile kendiliğinden silinir; ayrıca temizlik işi gerekmez.
 */
export interface IAuthAttempt extends Document {
  /** Sayacın kimliği — ör. "login:ip:1.2.3.4" veya "login:ip+email:1.2.3.4|a@b.c" */
  key: string;
  createdAt: Date;
}

/**
 * Kayıtların yaşayacağı süre. Pencere hesabı sorgu tarafında yapılır; bu değer
 * yalnızca çöpün ne zaman toplanacağını belirler ve en uzun pencereden büyük
 * olmalıdır.
 */
export const AUTH_ATTEMPT_TTL_SECONDS = 60 * 60; // 1 saat

const AuthAttemptSchema = new Schema<IAuthAttempt>({
  key: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

// Pencere içindeki denemeleri saymak için: önce anahtar, sonra zaman.
AuthAttemptSchema.index({ key: 1, createdAt: -1 });

// MongoDB kayıtları süresi dolunca kendisi siler.
// DİKKAT: index tanımı değişirse `npm run db:indexes` bir kez çalıştırılmalı —
// Mongoose mevcut bir TTL index'in süresini kendiliğinden güncellemez.
AuthAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: AUTH_ATTEMPT_TTL_SECONDS });

const AuthAttempt: Model<IAuthAttempt> =
  mongoose.models.AuthAttempt || mongoose.model<IAuthAttempt>("AuthAttempt", AuthAttemptSchema);

export default AuthAttempt;
