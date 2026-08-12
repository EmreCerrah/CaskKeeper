import { describe, it, expect } from "vitest";
import { buildListQuery } from "./list-query";
import { queryKeys } from "./keys";

/**
 * Query-string and key building are pure, so they are tested here; the hooks
 * themselves need React and a network and are verified on the phone.
 *
 * Both break expensively and quietly: a badly built query string ignores the
 * filter (the list looks right but is wrong), and inconsistent keys fetch the
 * same data twice and later split the offline cache.
 */
describe("buildListQuery", () => {
  it("always sends page and limit", () => {
    const q = buildListQuery({}, 1);
    expect(q).toContain("page=1");
    expect(q).toContain("limit=20");
  });

  it("never sends a filter that was not set", () => {
    // An empty `type=` could be read by the server as "those with an empty
    // type"; the parameter must be absent entirely.
    const q = buildListQuery({ region: "Islay" }, 2);
    expect(q).toContain("region=Islay");
    expect(q).not.toContain("type=");
    expect(q).not.toContain("search=");
    expect(q).toContain("page=2");
  });

  it("encodes spaces and special characters", () => {
    const q = buildListQuery({ search: "Highland Park" }, 1);
    expect(q).toContain("search=Highland+Park");
  });

  it("carries all the filters together", () => {
    const q = buildListQuery({ search: "x", type: "Single Malt", region: "Islay", country: "Scotland" }, 3);
    for (const part of ["search=x", "type=Single+Malt", "region=Islay", "country=Scotland", "page=3"]) {
      expect(q).toContain(part);
    }
  });
});

describe("queryKeys", () => {
  it("produces the same key for the same filters", () => {
    const a = queryKeys.whiskeys.list({ region: "Islay" });
    const b = queryKeys.whiskeys.list({ region: "Islay" });
    expect(a).toEqual(b);
  });

  it("produces different keys for different filters", () => {
    const a = queryKeys.whiskeys.list({ region: "Islay" });
    const b = queryKeys.whiskeys.list({ region: "Speyside" });
    expect(a).not.toEqual(b);
  });

  it("list, detail and facet keys share a common root", () => {
    // The root has to be shared so the whole catalogue cache can be
    // invalidated in one move later.
    expect(queryKeys.whiskeys.list({})[0]).toBe("whiskeys");
    expect(queryKeys.whiskeys.detail("x")[0]).toBe("whiskeys");
    expect(queryKeys.whiskeys.facets()[0]).toBe("whiskeys");
  });
});
