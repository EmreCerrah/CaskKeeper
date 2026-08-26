/**
 * buildCategoryPreferences / scoreByFlavorProfile testleri.
 *
 * Focus: normalising the weights correctly so they sum to 1, quietly ignoring
 * tags and terms that cannot be mapped, and making sure a whisky with several
 * terms from one category does not inflate its score.
 */

import { describe, it, expect } from "vitest";
import { buildCategoryPreferences, scoreByFlavorProfile } from "./recommendations";

function note(overrides: {
  noseTags?: string[];
  palateTags?: string[];
  finishTags?: string[];
}) {
  return {
    tastingDate: "2026-01-01",
    noseTags: [],
    palateTags: [],
    finishTags: [],
    ...overrides,
  };
}

describe("buildCategoryPreferences", () => {
  it("returns an empty map and a total of 0 with no notes", () => {
    const prefs = buildCategoryPreferences([]);
    expect(prefs.totalTags).toBe(0);
    expect(prefs.weights.size).toBe(0);
  });

  it("normalises the weights so they sum to 1", () => {
    const prefs = buildCategoryPreferences([
      note({ noseTags: ["Bal (Honey)"] }), // sweet
      note({ noseTags: ["Bal (Honey)"] }), // sweet
      note({ noseTags: ["Meşe (Oak)"] }), // woody
    ]);

    expect(prefs.totalTags).toBe(3);
    expect(prefs.weights.get("sweet")).toBeCloseTo(2 / 3);
    expect(prefs.weights.get("woody")).toBeCloseTo(1 / 3);

    const sum = [...prefs.weights.values()].reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1);
  });

  it("quietly ignores tags that cannot be mapped", () => {
    const prefs = buildCategoryPreferences([note({ noseTags: ["Uydurma Etiket"] })]);
    expect(prefs.totalTags).toBe(0);
    expect(prefs.weights.size).toBe(0);
  });
});

describe("scoreByFlavorProfile", () => {
  it("scores 0 when no category is shared", () => {
    const prefs = buildCategoryPreferences([note({ noseTags: ["Bal (Honey)"] })]); // sweet
    const result = scoreByFlavorProfile(["oak"], prefs); // woody
    expect(result.score).toBe(0);
    expect(result.matchedCategories).toEqual([]);
  });

  it("returns that category's weight on a single-category match", () => {
    const prefs = buildCategoryPreferences([
      note({ noseTags: ["Bal (Honey)"] }),
      note({ noseTags: ["Meşe (Oak)"] }),
    ]); // sweet: 0.5, woody: 0.5

    const result = scoreByFlavorProfile(["honey"], prefs); // sweet
    expect(result.score).toBeCloseTo(0.5);
    expect(result.matchedCategories).toEqual(["sweet"]);
  });

  it("several terms from one category do not inflate the score", () => {
    const prefs = buildCategoryPreferences([note({ noseTags: ["Bal (Honey)"] })]); // sweet: 1.0

    const result = scoreByFlavorProfile(["honey", "caramel", "toffee"], prefs); // hepsi sweet
    expect(result.score).toBeCloseTo(1.0);
  });

  it("sums the weights when several categories match", () => {
    const prefs = buildCategoryPreferences([
      note({ noseTags: ["Bal (Honey)"] }), // sweet
      note({ noseTags: ["Meşe (Oak)"] }), // woody
      note({ noseTags: ["Meşe (Oak)"] }), // woody
    ]); // sweet: 1/3, woody: 2/3

    const result = scoreByFlavorProfile(["honey", "oak"], prefs);
    expect(result.score).toBeCloseTo(1.0);
    expect(result.matchedCategories).toEqual(["woody", "sweet"]); // güçlü eşleşme önce
  });

  it("ignores catalogue terms that cannot be mapped", () => {
    const prefs = buildCategoryPreferences([note({ noseTags: ["Bal (Honey)"] })]); // sweet
    const result = scoreByFlavorProfile(["honey", "bilinmeyen-terim-xyz"], prefs);
    expect(result.score).toBeCloseTo(1.0);
    expect(result.matchedCategories).toEqual(["sweet"]);
  });

  it("scores 0 for an empty flavorProfile", () => {
    const prefs = buildCategoryPreferences([note({ noseTags: ["Bal (Honey)"] })]);
    const result = scoreByFlavorProfile([], prefs);
    expect(result.score).toBe(0);
  });
});
