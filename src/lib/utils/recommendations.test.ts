/**
 * buildCategoryPreferences / scoreByFlavorProfile testleri.
 *
 * Odak: ağırlıkların doğru normalize edilmesi (toplam 1), eşlenemeyen
 * etiketlerin/terimlerin sessizce yok sayılması ve bir viskinin aynı
 * kategoriden birden çok terime sahip olmasının skoru şişirmemesi.
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
  it("not yoksa boş harita ve toplam 0 döner", () => {
    const prefs = buildCategoryPreferences([]);
    expect(prefs.totalTags).toBe(0);
    expect(prefs.weights.size).toBe(0);
  });

  it("ağırlıklar toplamı 1'e normalize edilir", () => {
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

  it("eşlenemeyen etiketleri sessizce yok sayar", () => {
    const prefs = buildCategoryPreferences([note({ noseTags: ["Uydurma Etiket"] })]);
    expect(prefs.totalTags).toBe(0);
    expect(prefs.weights.size).toBe(0);
  });
});

describe("scoreByFlavorProfile", () => {
  it("hiç kategori ortak değilse skor 0'dır", () => {
    const prefs = buildCategoryPreferences([note({ noseTags: ["Bal (Honey)"] })]); // sweet
    const result = scoreByFlavorProfile(["oak"], prefs); // woody
    expect(result.score).toBe(0);
    expect(result.matchedCategories).toEqual([]);
  });

  it("tek kategori eşleşmesinde o kategorinin ağırlığını döner", () => {
    const prefs = buildCategoryPreferences([
      note({ noseTags: ["Bal (Honey)"] }),
      note({ noseTags: ["Meşe (Oak)"] }),
    ]); // sweet: 0.5, woody: 0.5

    const result = scoreByFlavorProfile(["honey"], prefs); // sweet
    expect(result.score).toBeCloseTo(0.5);
    expect(result.matchedCategories).toEqual(["sweet"]);
  });

  it("aynı kategoriden birden çok terim skoru şişirmez", () => {
    const prefs = buildCategoryPreferences([note({ noseTags: ["Bal (Honey)"] })]); // sweet: 1.0

    const result = scoreByFlavorProfile(["honey", "caramel", "toffee"], prefs); // hepsi sweet
    expect(result.score).toBeCloseTo(1.0);
  });

  it("birden çok kategori eşleşirse ağırlıkları toplar", () => {
    const prefs = buildCategoryPreferences([
      note({ noseTags: ["Bal (Honey)"] }), // sweet
      note({ noseTags: ["Meşe (Oak)"] }), // woody
      note({ noseTags: ["Meşe (Oak)"] }), // woody
    ]); // sweet: 1/3, woody: 2/3

    const result = scoreByFlavorProfile(["honey", "oak"], prefs);
    expect(result.score).toBeCloseTo(1.0);
    expect(result.matchedCategories).toEqual(["woody", "sweet"]); // güçlü eşleşme önce
  });

  it("katalogda eşlenemeyen terimleri yok sayar", () => {
    const prefs = buildCategoryPreferences([note({ noseTags: ["Bal (Honey)"] })]); // sweet
    const result = scoreByFlavorProfile(["honey", "bilinmeyen-terim-xyz"], prefs);
    expect(result.score).toBeCloseTo(1.0);
    expect(result.matchedCategories).toEqual(["sweet"]);
  });

  it("boş flavorProfile için skor 0'dır", () => {
    const prefs = buildCategoryPreferences([note({ noseTags: ["Bal (Honey)"] })]);
    const result = scoreByFlavorProfile([], prefs);
    expect(result.score).toBe(0);
  });
});
