/**
 * @file sync-indexes.ts
 * @description Veritabanı indekslerini model tanımlarıyla eşitler.
 *
 * Mongoose yeni indeksleri otomatik oluşturur ancak şemadan kaldırılan
 * indeksleri DÜŞÜRMEZ. `syncIndexes()` bu farkı kapatır: şemada olmayan
 * indeksleri siler, eksik olanları ekler.
 *
 * Ne zaman çalıştırılmalı:
 *   Bir modelin indeks tanımı değiştiğinde, dağıtımdan sonra bir kez.
 *
 * Kullanım:
 *   npm run db:sync-indexes
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import Whiskey from "../src/server/models/Whiskey";
import User from "../src/server/models/User";
import TastingNote from "../src/server/models/TastingNote";
import Follow from "../src/server/models/Follow";
import Like from "../src/server/models/Like";
import Comment from "../src/server/models/Comment";
import Notification from "../src/server/models/Notification";
import Wishlist from "../src/server/models/Wishlist";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI tanımlı değil. .env.local dosyasını kontrol edin.");
  process.exit(1);
}

const MODELS = [
  { name: "Whiskey", model: Whiskey },
  { name: "User", model: User },
  { name: "TastingNote", model: TastingNote },
  { name: "Follow", model: Follow },
  { name: "Like", model: Like },
  { name: "Comment", model: Comment },
  { name: "Notification", model: Notification },
  { name: "Wishlist", model: Wishlist },
];

async function main() {
  console.log("İndeks eşitleme başlıyor…\n");
  await mongoose.connect(MONGO_URI!);

  for (const { name, model } of MODELS) {
    // syncIndexes düşürülen indekslerin adlarını döndürür
    const dropped: string[] = await model.syncIndexes();

    if (dropped.length > 0) {
      console.log(`  ${name}: ${dropped.length} indeks düşürüldü → ${dropped.join(", ")}`);
    } else {
      console.log(`  ${name}: değişiklik yok`);
    }
  }

  await mongoose.disconnect();
  console.log("\n✅ İndeksler model tanımlarıyla eşitlendi.");
}

main().catch((error) => {
  console.error("❌ İndeks eşitleme başarısız:", error);
  process.exit(1);
});
