import { describe, it, expect } from "vitest";
import { acceptLanguageHeader, resolveLocale } from "./locale";
import { en, tr } from "./dictionaries";

describe("resolveLocale", () => {
  it("cihaz Türkçe istiyorsa Türkçe döner", () => {
    expect(resolveLocale(["tr"])).toBe("tr");
    expect(resolveLocale(["tr-TR"])).toBe("tr");
    expect(resolveLocale(["TR"])).toBe("tr");
  });

  it("Türkçe olmayan her cihaz İngilizce görür", () => {
    // Web'deki kuralın aynısı: Türkçe bilmeyen biri anlamadığı bir arayüzle
    // karşılaşmasın.
    expect(resolveLocale(["de-DE"])).toBe("en");
    expect(resolveLocale(["en-GB"])).toBe("en");
    expect(resolveLocale([])).toBe("en");
    expect(resolveLocale([null])).toBe("en");
  });

  it("yalnızca ilk tercihe bakar", () => {
    expect(resolveLocale(["de-DE", "tr"])).toBe("en");
  });
});

describe("acceptLanguageHeader", () => {
  it("sunucunun anlayacağı başlığı üretir", () => {
    // Sunucu Accept-Language'ın ilk dilinin ana kodunu okuyor.
    expect(acceptLanguageHeader("tr").split(",")[0]).toBe("tr-TR");
    expect(acceptLanguageHeader("en").split(",")[0]).toBe("en-GB");
  });
});

describe("sözlükler", () => {
  it("iki sözlük de aynı anahtar kümesini taşır", () => {
    // Tip sistemi bunu zaten zorluyor; test, tipin gevşetilmesi ihtimaline
    // karşı ikinci ağ.
    expect(Object.keys(en).sort()).toEqual(Object.keys(tr).sort());
  });

  it("hiçbir çeviri boş değildir", () => {
    for (const [key, value] of [...Object.entries(tr), ...Object.entries(en)]) {
      expect(value.trim(), `${key} boş`).not.toBe("");
    }
  });

  it("İngilizce sözlükte Türkçe'ye özgü harf kalmamıştır", () => {
    const suspicious = Object.entries(en).filter(([, value]) => /[çğıöşüÇĞİÖŞÜ]/.test(value));
    expect(suspicious).toEqual([]);
  });
});
