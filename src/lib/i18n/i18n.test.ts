import { describe, it, expect } from "vitest";
import { resolveLocale, isLocale, LOCALES, DEFAULT_LOCALE } from "./config";
import { createTranslator, getDictionary } from "./translate";
import { tr } from "./dictionaries/tr";
import { en } from "./dictionaries/en";

/**
 * Dil desteğinin sessiz hata veren yerleri.
 *
 * Bir anahtarın çevirisi unutulursa ekranda Türkçe metin ya da ham anahtar
 * görünür ama hiçbir yerde hata çıkmaz — bu yüzden sözlük bütünlüğü test
 * ediliyor. Aynı şekilde dil çözümlemesi yanlışsa Türkçe bilmeyen ziyaretçi
 * Türkçe arayüzle karşılaşır, ki özelliğin var olma sebebi budur.
 */

describe("sözlükler", () => {
  it("iki sözlük de aynı anahtar kümesini taşır", () => {
    const trKeys = Object.keys(tr).sort();
    const enKeys = Object.keys(en).sort();
    expect(enKeys).toEqual(trKeys);
  });

  it("hiçbir çeviri boş değildir", () => {
    for (const locale of LOCALES) {
      const dictionary = getDictionary(locale);
      for (const [key, value] of Object.entries(dictionary)) {
        expect(value.trim(), `${locale}/${key} boş`).not.toBe("");
      }
    }
  });

  it("İngilizce sözlükte Türkçe'ye özgü harf kalmamıştır", () => {
    // Çeviriyi kopyalayıp güncellemeyi unutmanın en sık işareti.
    const suspicious = Object.entries(en).filter(([, value]) => /[çğıöşüÇĞİÖŞÜ]/.test(value));
    expect(suspicious).toEqual([]);
  });
});

describe("çeviri fonksiyonu", () => {
  const t = createTranslator(getDictionary("en"));

  it("anahtarı karşılığına çevirir", () => {
    expect(t("nav.whiskies")).toBe("Whiskies");
  });

  it("yer tutucuları parametrelerle değiştirir", () => {
    const local = createTranslator({ ...getDictionary("en"), "nav.menu": "Hi {name}, {count} new" });
    expect(local("nav.menu", { name: "Emre", count: 3 })).toBe("Hi Emre, 3 new");
  });

  it("eksik parametreyi olduğu gibi bırakır, çökmez", () => {
    const local = createTranslator({ ...getDictionary("en"), "nav.menu": "Hi {name}" });
    expect(local("nav.menu", { other: "x" })).toBe("Hi {name}");
  });

  it("bilinmeyen anahtarda anahtarın kendisini döner", () => {
    const local = createTranslator({} as never);
    expect(local("nav.whiskies")).toBe("nav.whiskies");
  });
});

describe("dil çözümlemesi", () => {
  it("kullanıcının açık tercihi her şeyin önündedir", () => {
    expect(resolveLocale("tr", "en-US,en;q=0.9")).toBe("tr");
    expect(resolveLocale("en", "tr-TR,tr;q=0.9")).toBe("en");
  });

  it("tercih yoksa tarayıcı Türkçe istiyorsa Türkçe döner", () => {
    expect(resolveLocale(null, "tr-TR,tr;q=0.9,en;q=0.8")).toBe("tr");
    expect(resolveLocale(undefined, "tr")).toBe("tr");
  });

  it("Türkçe olmayan ziyaretçi İngilizce görür", () => {
    // Asıl amaç bu: Almanca konuşan biri anlamadığı bir arayüzle karşılaşmasın.
    expect(resolveLocale(null, "de-DE,de;q=0.9")).toBe("en");
    expect(resolveLocale(null, "en-GB,en;q=0.9")).toBe("en");
    expect(resolveLocale(null, null)).toBe("en");
  });

  it("geçersiz çerez değeri yok sayılır", () => {
    expect(resolveLocale("klingon", "tr-TR")).toBe("tr");
    expect(isLocale("klingon")).toBe(false);
    expect(isLocale(DEFAULT_LOCALE)).toBe(true);
  });
});
