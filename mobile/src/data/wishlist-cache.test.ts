import { describe, it, expect } from "vitest";
import { addToWishlist, removeFromWishlist, type WishlistPage } from "./wishlist-cache";
import type { Whiskey } from "./whiskeys";

/**
 * In an optimistic update the list and its `total` have to move together. If
 * they drift, the screen says "3 whiskies" above two cards and nothing errors.
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
  it("removes the whisky and decrements the total", () => {
    const result = removeFromWishlist(page(["a", "b", "c"]), "b");

    expect(result?.data.map((i) => i.whiskey.id)).toEqual(["a", "c"]);
    expect(result?.total).toBe(2);
  });

  it("changes nothing for a whisky that is not in the list", () => {
    // It may have been removed from another device; decrementing anyway would
    // make the count genuinely wrong.
    const cached = page(["a"]);
    const result = removeFromWishlist(cached, "yok");

    expect(result).toBe(cached);
    expect(result?.total).toBe(1);
  });

  it("does not let the total go below zero", () => {
    const cached: WishlistPage = { ...page(["a"]), total: 0 };
    expect(removeFromWishlist(cached, "a")?.total).toBe(0);
  });

  it("leaves an empty cache alone", () => {
    expect(removeFromWishlist(undefined, "a")).toBeUndefined();
  });
});

describe("addToWishlist", () => {
  it("adds the whisky at the FRONT and increments the total", () => {
    // The server sorts by date added, descending; appending would mean the
    // card moves after the next refresh.
    const result = addToWishlist(page(["a", "b"]), whiskey("yeni"), "2026-08-12T10:00:00.000Z");

    expect(result?.data.map((i) => i.whiskey.id)).toEqual(["yeni", "a", "b"]);
    expect(result?.total).toBe(3);
    expect(result?.data[0].addedAt).toBe("2026-08-12T10:00:00.000Z");
  });

  it("does not add a whisky that is already in the list", () => {
    const cached = page(["a", "b"]);
    const result = addToWishlist(cached, whiskey("a"), "2026-08-12T10:00:00.000Z");

    expect(result).toBe(cached);
    expect(result?.data).toHaveLength(2);
  });

  it("can add to an empty list", () => {
    const result = addToWishlist(page([]), whiskey("ilk"), "2026-08-12T10:00:00.000Z");

    expect(result?.data.map((i) => i.whiskey.id)).toEqual(["ilk"]);
    expect(result?.total).toBe(1);
  });

  it("leaves an empty cache alone", () => {
    expect(addToWishlist(undefined, whiskey("a"), "2026-08-12T10:00:00.000Z")).toBeUndefined();
  });
});
