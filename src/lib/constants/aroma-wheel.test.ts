import { describe, it, expect } from "vitest";
import { AROMA_TAG_CATEGORIES } from "./aroma-wheel";

/**
 * Aroma etiketleri veritabanına OLDUĞU GİBİ metin olarak yazılıyor; istatistik
 * ve öneri motoru bu metinleri eşleştiriyor. Yani bu liste veri şemasının bir
 * parçası, salt görsel bir sabit değil.
 *
 * Mobil uygulama aynı listeyi /api/aroma-wheel üzerinden okuyor. Buradaki
 * kurallar bozulursa iki istemci farklı etiket üretir ve kimse hata görmez —
 * sadece istatistikler yanlış olur.
 */
describe("aroma çarkı — veri bütünlüğü", () => {
  const allTags = AROMA_TAG_CATEGORIES.flatMap((c) => c.tags);

  it("kategori kimlikleri benzersizdir", () => {
    const ids = AROMA_TAG_CATEGORIES.map((c) => c.category);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("aynı etiket iki kategoride birden geçmez", () => {
    // Geçseydi, bir etiketin hangi kategoriye sayılacağı belirsizleşir ve
    // aroma trend grafiği sessizce çift sayardı.
    const duplicates = allTags.filter((tag, i) => allTags.indexOf(tag) !== i);
    expect(duplicates).toEqual([]);
  });

  it("hiçbir etiket boş ya da baş/son boşluklu değildir", () => {
    // Saklanan değer bu; kenar boşluğu eşleşmeyi sessizce bozar.
    for (const tag of allTags) {
      expect(tag).toBe(tag.trim());
      expect(tag.length).toBeGreaterThan(0);
    }
  });

  it("her kategoride en az bir etiket vardır", () => {
    for (const category of AROMA_TAG_CATEGORIES) {
      expect(category.tags.length, `${category.category} boş`).toBeGreaterThan(0);
    }
  });
});
