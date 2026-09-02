import { describe, it, expect } from "vitest";
import { decideCache } from "./cache-owner";

/**
 * Getting this backwards is silent in both directions, and the two mistakes
 * are not equal.
 *
 * Keep when it should discard: one person's notes are shown to the next, and a
 * write they made offline is posted into the newcomer's account — the queued
 * request takes its token when it is replayed, not when it was tapped.
 *
 * Discard when it should keep: a user who came back after their token expired
 * loses a note they wrote with no connection. Nothing errors; the note is
 * simply gone.
 */
describe("decideCache", () => {
  it("keeps the cache for the person it belongs to", () => {
    expect(decideCache("user-1", "user-1")).toBe("keep");
  });

  it("discards it for anyone else", () => {
    expect(decideCache("user-1", "user-2")).toBe("discard");
  });

  it("discards it when no one has claimed it", () => {
    // Either the store is empty, or it was written by a version that recorded
    // no owner. There is no way to tell whose it is, so it goes.
    expect(decideCache(null, "user-1")).toBe("discard");
  });

  it("does not treat a different id as the same because it looks similar", () => {
    expect(decideCache("user-1", "user-10")).toBe("discard");
    expect(decideCache("652f1c9e4b3a2d1f00a1b2c3", "652f1c9e4b3a2d1f00a1b2c4")).toBe("discard");
  });
});
