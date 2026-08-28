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
 * The Cache API belongs to the browser and does not exist in the test
 * environment, so an in-memory stand-in is built. The aim is to pin the storage
 * behaviour: is it recorded whose copy this is, does a missing record fall to
 * the safe side, does deleting really clear things.
 *
 * These rules matter because their failures are silent: show the wrong user's
 * data, or fail to delete, and the app misbehaves without erroring.
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

  /** So the test can set up the corrupt-record scenario. */
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

describe("the offline copy store", () => {
  it("reports the fake Cache API as supported in the test environment", () => {
    expect(isOfflineStorageSupported()).toBe(true);
  });

  it("saves the copy and reads the same thing back", async () => {
    await seed();

    const snapshot = await readOfflineSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot!.notes).toHaveLength(1);
    expect(snapshot!.notes[0].id).toBe("n1");
    expect(snapshot!.wishlist[0].whiskey.id).toBe("w1");
  });

  it("records whose copy it is, and the counts", async () => {
    const meta = await seed();

    expect(meta.userId).toBe("u1");
    expect(meta.userName).toBe("Emre");
    expect(meta.noteCount).toBe(1);
    expect(meta.wishlistCount).toBe(1);
    expect(Number.isNaN(Date.parse(meta.syncedAt))).toBe(false);
  });

  it("returns null with no record rather than throwing", async () => {
    expect(await readOfflineSnapshot()).toBeNull();
    expect(await getSnapshotMeta()).toBeNull();
  });

  it("nothing can be read after deletion", async () => {
    await seed();
    await clearOfflineSnapshot();

    expect(await readOfflineSnapshot()).toBeNull();
    expect(await getSnapshotMeta()).toBeNull();
  });

  it("shows no half data when one of the records is missing", async () => {
    await seed();
    const cache = caches_.get("caskkeeper-offline-v1")!;
    cache.delete("/__offline/wishlist");

    expect(await readOfflineSnapshot()).toBeNull();
  });

  it("does not crash on corrupt JSON", async () => {
    await seed();
    const cache = caches_.get("caskkeeper-offline-v1")!;
    cache.setRaw("/__offline/tasting-notes", "{bozuk");

    expect(await readOfflineSnapshot()).toBeNull();
  });

  it("keeps personal data in a bucket separate from the asset cache", async () => {
    await seed();

    expect(caches_.has("caskkeeper-offline-v1")).toBe(true);
    // Static assets must survive sign-out, which is why they are in their own
    // bucket.
    expect(caches_.has("caskkeeper-v1")).toBe(false);
  });
});
