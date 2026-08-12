import { describe, it, expect } from "vitest";
import { acceptLanguageHeader, resolveLocale } from "./locale";
import { en, tr } from "./dictionaries";

describe("resolveLocale", () => {
  it("returns Turkish when the device asks for Turkish", () => {
    expect(resolveLocale(["tr"])).toBe("tr");
    expect(resolveLocale(["tr-TR"])).toBe("tr");
    expect(resolveLocale(["TR"])).toBe("tr");
  });

  it("every non-Turkish device sees English", () => {
    // The same rule as the web: somebody who does not read Turkish should not
    // meet an interface they cannot use.
    expect(resolveLocale(["de-DE"])).toBe("en");
    expect(resolveLocale(["en-GB"])).toBe("en");
    expect(resolveLocale([])).toBe("en");
    expect(resolveLocale([null])).toBe("en");
  });

  it("looks only at the first preference", () => {
    expect(resolveLocale(["de-DE", "tr"])).toBe("en");
  });
});

describe("acceptLanguageHeader", () => {
  it("produces a header the server understands", () => {
    // The server reads the primary code of the first language in
    // Accept-Language.
    expect(acceptLanguageHeader("tr").split(",")[0]).toBe("tr-TR");
    expect(acceptLanguageHeader("en").split(",")[0]).toBe("en-GB");
  });
});

describe("dictionaries", () => {
  it("both dictionaries carry the same set of keys", () => {
    // The type system already enforces this; the test is a second net in case
    // the type is ever loosened.
    expect(Object.keys(en).sort()).toEqual(Object.keys(tr).sort());
  });

  it("no translation is empty", () => {
    for (const [key, value] of [...Object.entries(tr), ...Object.entries(en)]) {
      expect(value.trim(), `${key} is empty`).not.toBe("");
    }
  });

  it("no Turkish-specific letter survives in the English dictionary", () => {
    const suspicious = Object.entries(en).filter(([, value]) => /[çğıöşüÇĞİÖŞÜ]/.test(value));
    expect(suspicious).toEqual([]);
  });
});
