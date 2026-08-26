/**
 * comparison.ts testleri.
 *
 * Focus: parsing the untrusted `whisky` parameter from the URL correctly —
 * single and multiple values, duplicates, the upper bound — and the edge cases
 * of the shared aroma intersection.
 */

import { describe, it, expect } from "vitest";
import {
  MAX_COMPARE_ITEMS,
  parseCompareSlugs,
  findSharedFlavors,
  buildCompareHref,
} from "./comparison";

describe("parseCompareSlugs", () => {
  it("returns an empty list when the parameter is absent", () => {
    expect(parseCompareSlugs(undefined)).toEqual([]);
  });

  it("turns a single string value into a list", () => {
    expect(parseCompareSlugs("lagavulin-16")).toEqual(["lagavulin-16"]);
  });

  it("returns multiple values keeping their order", () => {
    expect(parseCompareSlugs(["a", "b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("drops duplicate slugs", () => {
    expect(parseCompareSlugs(["a", "b", "a"])).toEqual(["a", "b"]);
  });

  it("trims the slugs past the upper bound", () => {
    expect(parseCompareSlugs(["a", "b", "c", "d", "e"])).toEqual(["a", "b", "c"]);
    expect(parseCompareSlugs(["a", "b", "c", "d"]).length).toBe(MAX_COMPARE_ITEMS);
  });

  it("drops empty and whitespace-only values", () => {
    expect(parseCompareSlugs(["a", "", "   ", "b"])).toEqual(["a", "b"]);
  });

  it("trims whitespace around the slugs", () => {
    expect(parseCompareSlugs("  lagavulin-16  ")).toEqual(["lagavulin-16"]);
  });
});

describe("findSharedFlavors", () => {
  it("returns an empty set when there are no profiles", () => {
    expect(findSharedFlavors([]).size).toBe(0);
  });

  it("an intersection is meaningless for one whisky, so returns an empty set", () => {
    expect(findSharedFlavors([["oak", "honey"]]).size).toBe(0);
  });

  it("finds the terms two whiskies share", () => {
    const shared = findSharedFlavors([
      ["oak", "honey", "smoke"],
      ["oak", "vanilla", "honey"],
    ]);

    expect(Array.from(shared).sort()).toEqual(["honey", "oak"]);
  });

  it("returns only the term present in all three whiskies", () => {
    const shared = findSharedFlavors([
      ["oak", "honey", "smoke"],
      ["oak", "honey", "vanilla"],
      ["oak", "pepper"],
    ]);

    expect(Array.from(shared)).toEqual(["oak"]);
  });

  it("returns an empty set when no term is shared", () => {
    const shared = findSharedFlavors([
      ["oak", "honey"],
      ["peat", "smoke"],
    ]);

    expect(shared.size).toBe(0);
  });

  it("an empty profile makes the intersection empty", () => {
    expect(findSharedFlavors([["oak"], []]).size).toBe(0);
  });
});

describe("buildCompareHref", () => {
  it("returns the bare path for an empty list", () => {
    expect(buildCompareHref([])).toBe("/compare");
  });

  it("repeats the parameter for each slug", () => {
    expect(buildCompareHref(["a", "b"])).toBe("/compare?whisky=a&whisky=b");
  });

  it("encodes characters that are unsafe in a URL", () => {
    expect(buildCompareHref(["a b"])).toBe("/compare?whisky=a+b");
  });
});
