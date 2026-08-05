import mongoose from "mongoose";

/**
 * @file db.ts
 * @description MongoDB bağlantısı ve bağlantı dizesinin doğrulanması.
 *
 * Kontroller BİLEREK modül seviyesinde değil, `connectToDatabase()` içinde.
 * Modül seviyesinde `throw` edildiğinde `db.ts`'i import eden 50 dosya yüzünden
 * `next build` ortam değişkeni olmadan hiç başlayamıyordu — oysa build sırasında
 * veritabanına bağlanılmıyor (veri çeken tüm sayfalar `force-dynamic`).
 * Dockerfile ve CI bu yüzden sahte bir bağlantı dizesi taşımak zorunda kalıyordu.
 */

/** İstemciye sızmaması için: dizedeki kimlik bilgisi hata mesajlarında maskelenir. */
function maskCredentials(uri: string): string {
  return uri.replace(/\/\/[^@]*@/, "//***:***@");
}

/**
 * Bağlantı dizesinden veritabanı adını çıkarır.
 *
 * `new URL()` KULLANILMIYOR: replica set dizeleri birden çok host'u virgülle
 * ayırıyor (`mongodb://host1:27017,host2:27017/db`) ve WHATWG URL ayrıştırıcısı
 * bunu geçersiz sayıp hata fırlatıyor.
 */
export function extractDatabaseName(uri: string): string {
  const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//i, "");
  // Kimlik bilgisi varsa host kısmı son '@'den sonra başlar.
  const afterCredentials = withoutScheme.slice(withoutScheme.lastIndexOf("@") + 1);
  const pathStart = afterCredentials.indexOf("/");
  if (pathStart === -1) return "";
  return afterCredentials.slice(pathStart + 1).split("?")[0];
}

/**
 * Ortam değişkenini doğrular ve bağlantı dizesini döndürür.
 *
 * Bağlanmadan önce çağrılır; hatalar sessiz kalmasın diye açıkça fırlatılır.
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
    // Başarısız denemeyi saklamayalım: aksi halde ilk hatadan sonraki her istek
    // aynı reddedilmiş promise'i alır ve bağlantı bir daha hiç denenmez.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
