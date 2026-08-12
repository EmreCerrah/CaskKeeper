import { describe, it, expect } from "vitest";
import { aromaCategoryKey } from "./aroma";
import { en, tr } from "./dictionaries";

describe("aromaCategoryKey", () => {
  it("every known category maps to a translation key", () => {
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
      // Does the key actually exist in the dictionary — otherwise the raw key
      // ends up on screen.
      expect(tr[key]).toBeTruthy();
      expect(en[key]).toBeTruthy();
    }
  });

  it("an unrecognised category falls back to 'Other'", () => {
    // If a new category is added to the catalogue, the raw id
    // ("umami_savory") must not appear on screen until the app catches up.
    expect(aromaCategoryKey("umami_savory")).toBe("aroma.feinty_other");
    expect(aromaCategoryKey("")).toBe("aroma.feinty_other");
  });
});
