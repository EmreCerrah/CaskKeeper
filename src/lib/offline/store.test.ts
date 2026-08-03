import { describe, it, expect, beforeEach, vi } from "vitest";
import type { TastingNoteDTO, WishlistItemDTO } from "@/lib/types/dto";
import {
  saveOfflineSnapshot,
  readOfflineSnapshot,
  clearOfflineSnapshot,
  getSnapshotMeta,
  isOfflineStorageSupported,
} from "./store";

/**
 * Cache API tarayıcıya ait olduğu için test ortamında yok; bellek içi bir
 * karşılığı kuruluyor. Amaç depolama davranışını doğrulamak: kopyanın kime ait
 * olduğu kaydediliyor mu, eksik kayıtta güvenli tarafa mı düşüyor, silme
 * gerçekten temizliyor mu.
 *
 * Bu kurallar önemli çünkü hatası sessiz: yanlış kullanıcının verisi
 * gösterilirse ya da silme çalışmazsa uygulama hata vermeden yanlış davranır.
 */
class FakeCache {
  private store = new Map<string, string>();

  async put(key: string, response: Response) {
    this.store.set(key, await response.text());
  }

  async match(key: string) {
    const body = this.store.get(key);
    return body === undefined ? undefined : new Response(body);
  }

  /** Testin bozuk kayıt senaryosunu kurabilmesi için. */
  setRaw(key: string, body: string) {
    this.store.set(key, body);
  }

  delete(key: string) {
    return this.store.delete(key);
  }
}

const caches_ = new Map<string, FakeCache>();

beforeEach(() => {
  caches_.clear();
  vi.stubGlobal("caches", {
    open: async (name: string) => {
      if (!caches_.has(name)) caches_.set(name, new FakeCache());
      return caches_.get(name)!;
    },
    delete: async (name: string) => caches_.delete(name),
  });
});

const note = { id: "n1", rating: 88 } as unknown as TastingNoteDTO;
const wishlistItem = {
  whiskey: { id: "w1", name: "Lagavulin 16" },
  addedAt: "2026-01-01T00:00:00.000Z",
} as unknown as WishlistItemDTO;

async function seed() {
  return saveOfflineSnapshot({
    userId: "u1",
    userName: "Emre",
    notes: [note],
    wishlist: [wishlistItem],
  });
}

describe("çevrimdışı kopya deposu", () => {
  it("test ortamında sahte Cache API destekli görünür", () => {
    expect(isOfflineStorageSupported()).toBe(true);
  });

  it("kopyayı kaydeder ve aynısını geri okur", async () => {
    await seed();

    const snapshot = await readOfflineSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot!.notes).toHaveLength(1);
    expect(snapshot!.notes[0].id).toBe("n1");
    expect(snapshot!.wishlist[0].whiskey.id).toBe("w1");
  });

  it("kopyanın kime ait olduğunu ve sayıları kaydeder", async () => {
    const meta = await seed();

    expect(meta.userId).toBe("u1");
    expect(meta.userName).toBe("Emre");
    expect(meta.noteCount).toBe(1);
    expect(meta.wishlistCount).toBe(1);
    expect(Number.isNaN(Date.parse(meta.syncedAt))).toBe(false);
  });

  it("kayıt yokken null döner, hata fırlatmaz", async () => {
    expect(await readOfflineSnapshot()).toBeNull();
    expect(await getSnapshotMeta()).toBeNull();
  });

  it("silme sonrası hiçbir şey okunamaz", async () => {
    await seed();
    await clearOfflineSnapshot();

    expect(await readOfflineSnapshot()).toBeNull();
    expect(await getSnapshotMeta()).toBeNull();
  });

  it("kayıtlardan biri eksikse yarım veri göstermez", async () => {
    await seed();
    const cache = caches_.get("caskkeeper-offline-v1")!;
    cache.delete("/__offline/wishlist");

    expect(await readOfflineSnapshot()).toBeNull();
  });

  it("bozuk JSON'da çökmez", async () => {
    await seed();
    const cache = caches_.get("caskkeeper-offline-v1")!;
    cache.setRaw("/__offline/tasting-notes", "{bozuk");

    expect(await readOfflineSnapshot()).toBeNull();
  });

  it("kişisel veriyi varlık önbelleğinden ayrı kovada tutar", async () => {
    await seed();

    expect(caches_.has("caskkeeper-offline-v1")).toBe(true);
    // Statik varlıklar çıkışta silinmemeli; bu yüzden ayrı kovadalar.
    expect(caches_.has("caskkeeper-v1")).toBe(false);
  });
});
