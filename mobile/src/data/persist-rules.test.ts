import { describe, it, expect } from "vitest";
import { shouldPersistQuery } from "./persist-rules";
import { queryKeys } from "./keys";

/**
 * This rule is a privacy boundary: it decides what stays on the device
 * permanently. Drifting to the wrong side would be silent — the app keeps
 * working, other people's tasting notes just sit on the phone.
 *
 * The tests use the real key builders, so a change to the key shape breaks
 * them rather than passing quietly against hand-written arrays.
 */
describe("shouldPersistQuery — what is stored", () => {
  it("stores the catalogue list, detail and facets", () => {
    expect(shouldPersistQuery(queryKeys.whiskeys.list({}))).toBe(true);
    expect(shouldPersistQuery(queryKeys.whiskeys.list({ region: "Islay" }))).toBe(true);
    expect(shouldPersistQuery(queryKeys.whiskeys.detail("ardbeg-10"))).toBe(true);
    expect(shouldPersistQuery(queryKeys.whiskeys.facets())).toBe(true);
  });

  it("stores the aroma wheel", () => {
    expect(shouldPersistQuery(queryKeys.aromaWheel())).toBe(true);
  });

  it("stores my own tasting notes", () => {
    expect(shouldPersistQuery(queryKeys.tastingNotes.mine())).toBe(true);
  });

  it("stores the dashboard and statistics — computed from my own notes", () => {
    expect(shouldPersistQuery(queryKeys.dashboard())).toBe(true);
    expect(shouldPersistQuery(queryKeys.analytics())).toBe(true);
  });

  it("stores the wishlist and a single whisky's state", () => {
    expect(shouldPersistQuery(queryKeys.wishlist.list())).toBe(true);
    expect(shouldPersistQuery(queryKeys.wishlist.status("abc"))).toBe(true);
  });
});

describe("shouldPersistQuery — what is not stored", () => {
  it("does not store the FEED — other people's notes", () => {
    expect(shouldPersistQuery(queryKeys.feed())).toBe(false);
  });

  it("does not store user search, profiles or their notes", () => {
    expect(shouldPersistQuery(queryKeys.users.search("emre"))).toBe(false);
    expect(shouldPersistQuery(queryKeys.users.profile("abc"))).toBe(false);
    expect(shouldPersistQuery(queryKeys.users.notes("abc"))).toBe(false);
  });

  it("does not store RECOMMENDATIONS — a computed list that shifts with every note", () => {
    expect(shouldPersistQuery(queryKeys.recommendations())).toBe(false);
  });

  it("does not store COMMENTS — text other people wrote", () => {
    expect(shouldPersistQuery(queryKeys.comments.list("abc"))).toBe(false);
  });

  it("does not store NOTIFICATIONS — other people's names, and a stale count lies", () => {
    expect(shouldPersistQuery(queryKeys.notifications.list())).toBe(false);
    expect(shouldPersistQuery(queryKeys.notifications.unread())).toBe(false);
  });

  it("does not store a single note's detail — from the feed it may be someone else's", () => {
    expect(shouldPersistQuery(queryKeys.tastingNotes.detail("abc"))).toBe(false);
  });

  it("does not store an unrecognised key", () => {
    // The default has to be NO: a query added later must not reach disk until
    // somebody decides it should.
    expect(shouldPersistQuery(["birSey", "baska"])).toBe(false);
    expect(shouldPersistQuery([])).toBe(false);
    expect(shouldPersistQuery([42])).toBe(false);
  });
});
