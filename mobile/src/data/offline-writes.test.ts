import { describe, it, expect } from "vitest";
import { wishlistToggleRequest } from "./offline-writes";

/**
 * The inversion is the whole point of these tests.
 *
 * `wishlisted` is the state the whisky is in, so the request has to do the
 * opposite of what the flag reads like. Getting it backwards would not throw
 * anywhere: the button would flip on screen exactly as it does now, and the
 * server would be told the reverse. Offline that gap widens from milliseconds
 * to however long the device stays without a connection.
 */
describe("wishlistToggleRequest", () => {
  it("removes a whisky that is already on the list", () => {
    expect(wishlistToggleRequest({ whiskey: { id: "abc" }, wishlisted: true })).toEqual({
      path: "/api/wishlist/abc",
      method: "DELETE",
    });
  });

  it("adds a whisky that is not on the list", () => {
    expect(wishlistToggleRequest({ whiskey: { id: "abc" }, wishlisted: false })).toEqual({
      path: "/api/wishlist/abc",
      method: "POST",
    });
  });

  it("addresses the whisky by its id", () => {
    expect(wishlistToggleRequest({ whiskey: { id: "652f1c" }, wishlisted: false }).path).toBe(
      "/api/wishlist/652f1c"
    );
  });

  it("is its own inverse — toggling twice returns to the starting state", () => {
    const whiskey = { id: "abc" };
    const added = wishlistToggleRequest({ whiskey, wishlisted: false });
    const removed = wishlistToggleRequest({ whiskey, wishlisted: true });

    // Replaying a queue that holds both, in order, leaves the server where it
    // started. The endpoints are idempotent (upsert / delete), so a repeated
    // or redundant replay cannot fail either.
    expect(added.method).toBe("POST");
    expect(removed.method).toBe("DELETE");
  });
});
