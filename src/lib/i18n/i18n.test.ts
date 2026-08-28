import { describe, it, expect } from "vitest";
import { resolveLocale, isLocale, LOCALES, DEFAULT_LOCALE } from "./config";
import { createTranslator, getDictionary } from "./translate";
import { tr } from "./dictionaries/tr";
import { en } from "./dictionaries/en";

/**
 * The places where language support fails silently.
 *
 * Forget to translate a key and the screen shows Turkish text or a raw key
 * while nothing errors anywhere — which is why dictionary integrity is tested.
 * Likewise, if language resolution is wrong, a visitor who does not read
 * Turkish meets a Turkish interface — the very thing the feature exists to
 * prevent.
 */

describe("the dictionaries", () => {
  it("both dictionaries carry the same set of keys", () => {
    const trKeys = Object.keys(tr).sort();
    const enKeys = Object.keys(en).sort();
    expect(enKeys).toEqual(trKeys);
  });

  it("no translation is empty", () => {
    for (const locale of LOCALES) {
      const dictionary = getDictionary(locale);
      for (const [key, value] of Object.entries(dictionary)) {
        expect(value.trim(), `${locale}/${key} boş`).not.toBe("");
      }
    }
  });

  it("no Turkish-specific letter survives in the English dictionary", () => {
    // The commonest sign of copying a translation and forgetting to update it.
    const suspicious = Object.entries(en).filter(([, value]) => /[çğıöşüÇĞİÖŞÜ]/.test(value));
    expect(suspicious).toEqual([]);
  });
});

describe("the translation function", () => {
  const t = createTranslator(getDictionary("en"));

  it("renders a key as its text", () => {
    expect(t("nav.whiskies")).toBe("Whiskies");
  });

  it("replaces placeholders with the parameters", () => {
    const local = createTranslator({ ...getDictionary("en"), "nav.menu": "Hi {name}, {count} new" });
    expect(local("nav.menu", { name: "Emre", count: 3 })).toBe("Hi Emre, 3 new");
  });

  it("leaves a missing parameter as it is rather than crashing", () => {
    const local = createTranslator({ ...getDictionary("en"), "nav.menu": "Hi {name}" });
    expect(local("nav.menu", { other: "x" })).toBe("Hi {name}");
  });

  it("returns the key itself for an unknown key", () => {
    const local = createTranslator({} as never);
    expect(local("nav.whiskies")).toBe("nav.whiskies");
  });
});

describe("language resolution", () => {
  it("the user's explicit choice comes before everything", () => {
    expect(resolveLocale("tr", "en-US,en;q=0.9")).toBe("tr");
    expect(resolveLocale("en", "tr-TR,tr;q=0.9")).toBe("en");
  });

  it("without a preference, returns Turkish when the browser asks for it", () => {
    expect(resolveLocale(null, "tr-TR,tr;q=0.9,en;q=0.8")).toBe("tr");
    expect(resolveLocale(undefined, "tr")).toBe("tr");
  });

  it("a non-Turkish visitor sees English", () => {
    // This is the whole point: a German speaker should not meet an interface
    // they cannot read.
    expect(resolveLocale(null, "de-DE,de;q=0.9")).toBe("en");
    expect(resolveLocale(null, "en-GB,en;q=0.9")).toBe("en");
    expect(resolveLocale(null, null)).toBe("en");
  });

  it("an invalid cookie value is ignored", () => {
    expect(resolveLocale("klingon", "tr-TR")).toBe("tr");
    expect(isLocale("klingon")).toBe(false);
    expect(isLocale(DEFAULT_LOCALE)).toBe(true);
  });
});
