import { describe, it, expect } from "vitest";
import { addToWishlist, removeFromWishlist, type WishlistPage } from "./wishlist-cache";
import type { Whiskey } from "./whiskeys";

/**
 * İyimser güncellemede liste ile `total` birlikte değişmek zorunda. Ayrışırlarsa
 * ekranda "3 viski" yazarken iki kart görünür ve hiçbir yerde hata çıkmaz.
 */
function whiskey(id: string): Whiskey {
  return {
    id,
    brand: "Test",
    name: id,
    slug: id,
    distillery: "Test Distillery",
    type: "Single Malt",
    region: "Islay",
    country: "Scotland",
    abv: 46,
    limitedEdition: false,
    flavorProfile: [],
    awards: [],
    tags: [],
  };
}

function page(ids: string[]): WishlistPage {
  return {
    data: ids.map((id) => ({ whiskey: whiskey(id), addedAt: "2026-08-01T00:00:00.000Z" })),
    total: ids.length,
    page: 1,
    limit: 100,
    totalPages: 1,
  };
}

describe("removeFromWishlist", () => {
  it("viskiyi çıkarır ve toplamı bir azaltır", () => {
    const result = removeFromWishlist(page(["a", "b", "c"]), "b");

    expect(result?.data.map((i) => i.whiskey.id)).toEqual(["a", "c"]);
    expect(result?.total).toBe(2);
  });

  it("listede olmayan viski için hiçbir şeyi değiştirmez", () => {
    // Başka bir cihazdan kaldırılmış olabilir; toplamı yine de eksiltmek
    // sayıyı gerçekten yanlış yapardı.
    const cached = page(["a"]);
    const result = removeFromWishlist(cached, "yok");

    expect(result).toBe(cached);
    expect(result?.total).toBe(1);
  });

  it("toplam sıfırın altına inmez", () => {
    const cached: WishlistPage = { ...page(["a"]), total: 0 };
    expect(removeFromWishlist(cached, "a")?.total).toBe(0);
  });

  it("önbellek boşsa dokunmaz", () => {
    expect(removeFromWishlist(undefined, "a")).toBeUndefined();
  });
});

describe("addToWishlist", () => {
  it("viskiyi BAŞA ekler ve toplamı bir artırır", () => {
    // Sunucu eklenme tarihine göre azalan sıralıyor; sona eklemek kartın
    // tazelemeden sonra yer değiştirmesi demek olurdu.
    const result = addToWishlist(page(["a", "b"]), whiskey("yeni"), "2026-08-12T10:00:00.000Z");

    expect(result?.data.map((i) => i.whiskey.id)).toEqual(["yeni", "a", "b"]);
    expect(result?.total).toBe(3);
    expect(result?.data[0].addedAt).toBe("2026-08-12T10:00:00.000Z");
  });

  it("zaten listedeki viskiyi ikinci kez eklemez", () => {
    const cached = page(["a", "b"]);
    const result = addToWishlist(cached, whiskey("a"), "2026-08-12T10:00:00.000Z");

    expect(result).toBe(cached);
    expect(result?.data).toHaveLength(2);
  });

  it("boş listeye ekleyebilir", () => {
    const result = addToWishlist(page([]), whiskey("ilk"), "2026-08-12T10:00:00.000Z");

    expect(result?.data.map((i) => i.whiskey.id)).toEqual(["ilk"]);
    expect(result?.total).toBe(1);
  });

  it("önbellek boşsa dokunmaz", () => {
    expect(addToWishlist(undefined, whiskey("a"), "2026-08-12T10:00:00.000Z")).toBeUndefined();
  });
});
