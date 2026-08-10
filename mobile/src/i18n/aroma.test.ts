import { describe, it, expect } from "vitest";
import { aromaCategoryKey } from "./aroma";
import { en, tr } from "./dictionaries";

describe("aromaCategoryKey", () => {
  it("bilinen her kategori bir çeviri anahtarına karşılık gelir", () => {
    const categories = [
      "fruity",
      "floral",
      "woody",
      "sweet",
      "spicy",
      "smoky_peaty",
      "nutty",
      "cereal",
      "feinty_other",
    ];

    for (const category of categories) {
      const key = aromaCategoryKey(category);
      expect(key).toBe(`aroma.${category}`);
      // Anahtar sözlükte gerçekten var mı — yoksa ekranda ham anahtar görünür.
      expect(tr[key]).toBeTruthy();
      expect(en[key]).toBeTruthy();
    }
  });

  it("tanınmayan kategori 'Diğer'e düşer", () => {
    // Kataloğa yeni kategori eklenirse mobil sürüm güncellenene kadar ham
    // kimlik ("umami_savory") ekranda görünmemeli.
    expect(aromaCategoryKey("umami_savory")).toBe("aroma.feinty_other");
    expect(aromaCategoryKey("")).toBe("aroma.feinty_other");
  });
});
