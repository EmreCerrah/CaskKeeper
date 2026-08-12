import { describe, it, expect } from "vitest";
import { shouldPersistQuery } from "./persist-rules";
import { queryKeys } from "./keys";

/**
 * Bu kural bir gizlilik sınırı: cihazda kalıcı olarak ne duracağını belirliyor.
 * Yanlış tarafa kayması sessiz olurdu — uygulama çalışmaya devam eder, sadece
 * başkalarının tadım notları telefonda durur.
 *
 * Testler gerçek anahtar üreticileriyle yazıldı; anahtar şekli değişirse burası
 * da kırılsın, elle yazılmış diziler yüzünden sessizce geçmesin.
 */
describe("shouldPersistQuery — saklananlar", () => {
  it("katalog listesi, detayı ve filtreleri saklanır", () => {
    expect(shouldPersistQuery(queryKeys.whiskeys.list({}))).toBe(true);
    expect(shouldPersistQuery(queryKeys.whiskeys.list({ region: "Islay" }))).toBe(true);
    expect(shouldPersistQuery(queryKeys.whiskeys.detail("ardbeg-10"))).toBe(true);
    expect(shouldPersistQuery(queryKeys.whiskeys.facets())).toBe(true);
  });

  it("aroma çarkı saklanır", () => {
    expect(shouldPersistQuery(queryKeys.aromaWheel())).toBe(true);
  });

  it("kendi tadım notlarım saklanır", () => {
    expect(shouldPersistQuery(queryKeys.tastingNotes.mine())).toBe(true);
  });

  it("panel ve istatistikler saklanır — kendi notlarımdan hesaplanıyor", () => {
    expect(shouldPersistQuery(queryKeys.dashboard())).toBe(true);
    expect(shouldPersistQuery(queryKeys.analytics())).toBe(true);
  });

  it("istek listesi ve tek viski durumu saklanır", () => {
    expect(shouldPersistQuery(queryKeys.wishlist.list())).toBe(true);
    expect(shouldPersistQuery(queryKeys.wishlist.status("abc"))).toBe(true);
  });
});

describe("shouldPersistQuery — saklanmayanlar", () => {
  it("AKIŞ saklanmaz — başkalarının notları", () => {
    expect(shouldPersistQuery(queryKeys.feed())).toBe(false);
  });

  it("kullanıcı arama, profil ve notları saklanmaz", () => {
    expect(shouldPersistQuery(queryKeys.users.search("emre"))).toBe(false);
    expect(shouldPersistQuery(queryKeys.users.profile("abc"))).toBe(false);
    expect(shouldPersistQuery(queryKeys.users.notes("abc"))).toBe(false);
  });

  it("ÖNERİLER saklanmaz — her yeni notla değişen hesaplanmış liste", () => {
    expect(shouldPersistQuery(queryKeys.recommendations())).toBe(false);
  });

  it("YORUMLAR saklanmaz — başkalarının yazdığı metinler", () => {
    expect(shouldPersistQuery(queryKeys.comments.list("abc"))).toBe(false);
  });

  it("BİLDİRİMLER saklanmaz — başkalarının adları, üstelik bayat sayı yalan söyler", () => {
    expect(shouldPersistQuery(queryKeys.notifications.list())).toBe(false);
    expect(shouldPersistQuery(queryKeys.notifications.unread())).toBe(false);
  });

  it("tek not detayı saklanmaz — akıştan açılan başkasının olabilir", () => {
    expect(shouldPersistQuery(queryKeys.tastingNotes.detail("abc"))).toBe(false);
  });

  it("tanınmayan bir anahtar saklanmaz", () => {
    // Varsayılan HAYIR olmalı: ileride eklenen bir sorgu, biri bilinçli karar
    // verene kadar diske yazılmasın.
    expect(shouldPersistQuery(["birSey", "baska"])).toBe(false);
    expect(shouldPersistQuery([])).toBe(false);
    expect(shouldPersistQuery([42])).toBe(false);
  });
});
