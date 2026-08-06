import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  /** bcrypt hash — asla düz metin parola saklanmaz, asla DTO'ya çıkmaz */
  passwordHash: string;
  profilePicture?: string;
  bio?: string;
  role: "user" | "admin";
  /**
   * Hesabın kapatıldığı an. VARLIĞI kapalı demektir — ayrıca bir `status` alanı
   * tutulmaz, çünkü iki alan birbirine düşebilir.
   *
   * Kapatma KALICIDIR; geri açma yoktur. Kayıtlar yine de silinmez: tadım
   * notları, başkalarının notlarına yazılmış yorumlar, takipler ve bildirimler
   * hep User'a referans veriyor, gerçek silme başkalarının verisini kırardı.
   * Görünürlük UserRepository'deki aktif filtresiyle kapatılır.
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
 * E-posta benzersizliği YALNIZCA açık hesaplar için geçerlidir: hesabını
 * kapatan biri e-postasını serbest bırakır ve aynı adresle sıfırdan yeni bir
 * hesap açılabilir.
 *
 * Neden bileşik indeks, kısmi (partial) indeks değil: MongoDB
 * `partialFilterExpression` içinde `$exists: false` KABUL ETMİYOR (içeride
 * `$not`'a dönüşüyor, desteklenmiyor) — denendi, `CannotCreateIndex` verdi.
 * `status: "active"` gibi bir alanla çözülebilirdi ama o da mevcut kayıtlara
 * backfill gerektirirdi.
 *
 * Bileşik indeks bunların hiçbirine ihtiyaç duymuyor: eksik alan indekste
 * null sayılır, yani AÇIK her hesap `(email, null)` anahtarını alır ve aynı
 * e-postayla ikinci bir açık hesap açılamaz. Kapalı hesaplar `(email, tarih)`
 * taşıdığı için çakışmaz. Mevcut kayıtların hiçbirinde `closedAt` yok, bu
 * yüzden bugünkü benzersizlik olduğu gibi korunur.
 *
 * `email` önde olduğundan e-posta üzerinden yapılan sorgular indeksi
 * kullanmaya devam eder.
 *
 * İndeks tanımı değiştiği için dağıtımdan sonra bir kez `npm run db:indexes`.
 */
UserSchema.index({ email: 1, closedAt: 1 }, { unique: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
