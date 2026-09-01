import { describe, it, expect } from "vitest";
import { createNoteRequest, isRetryableStatus, wishlistToggleRequest } from "./offline-writes";
import type { TastingNoteInput } from "./tastingNotes";

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

describe("createNoteRequest", () => {
  const input = { whiskey: "w1", rating: 88 } as unknown as TastingNoteInput;

  it("posts only the note body", () => {
    const request = createNoteRequest({
      input,
      whiskey: { id: "w1", brand: "Ardbeg", name: "10 Year Old" },
      pendingId: "pending:1",
    });

    expect(request).toEqual({ path: "/api/tasting-notes", method: "POST", body: input });
  });

  it("keeps the card's whisky and the placeholder id out of the request", () => {
    // They ride along in the variables so the handlers can find their row, but
    // the server's schema rejects fields it does not know.
    const body = createNoteRequest({
      input,
      whiskey: { id: "w1", brand: "Ardbeg", name: "10 Year Old" },
      pendingId: "pending:1",
    }).body as Record<string, unknown>;

    expect(body).not.toHaveProperty("pendingId");
    expect(body.whiskey).toBe("w1");
  });
});

describe("isRetryableStatus", () => {
  it("retries when the server was never reached", () => {
    expect(isRetryableStatus(0)).toBe(true);
  });

  it("retries a server fault", () => {
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
  });

  it("does not retry a refusal about the request itself", () => {
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(404)).toBe(false);
    expect(isRetryableStatus(409)).toBe(false);
  });

  it("does not retry an expired session — the same token fails the same way", () => {
    expect(isRetryableStatus(401)).toBe(false);
  });
});
