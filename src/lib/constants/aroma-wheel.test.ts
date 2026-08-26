import { describe, it, expect } from "vitest";
import { AROMA_TAG_CATEGORIES } from "./aroma-wheel";

/**
 * Aroma tags are written to the database AS THEY ARE, as text, and the
 * statistics and recommendation engine match on that text. This list is
 * therefore part of the data schema, not a purely presentational constant.
 *
 * The mobile app reads the same list through /api/aroma-wheel. If the rules
 * here break, the two clients produce different tags and nobody sees an error —
 * the statistics are simply wrong.
 */
describe("the aroma wheel — data integrity", () => {
  const allTags = AROMA_TAG_CATEGORIES.flatMap((c) => c.tags);

  it("kategori kimlikleri benzersizdir", () => {
    const ids = AROMA_TAG_CATEGORIES.map((c) => c.category);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no tag appears in two categories", () => {
    // If one did, which category it counted towards would be ambiguous and the
    // aroma trend chart would quietly double-count it.
    const duplicates = allTags.filter((tag, i) => allTags.indexOf(tag) !== i);
    expect(duplicates).toEqual([]);
  });

  it("no tag is empty or padded with whitespace", () => {
    // This is the stored value; stray whitespace breaks matching silently.
    for (const tag of allTags) {
      expect(tag).toBe(tag.trim());
      expect(tag.length).toBeGreaterThan(0);
    }
  });

  it("every category has at least one tag", () => {
    for (const category of AROMA_TAG_CATEGORIES) {
      expect(category.tags.length, `${category.category} boş`).toBeGreaterThan(0);
    }
  });
});
