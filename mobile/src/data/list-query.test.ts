import { describe, it, expect } from "vitest";
import { buildListQuery } from "./list-query";
import { queryKeys } from "./keys";

/**
 * Sorgu dizesi ve anahtar üretimi saf olduğu için burada sınanıyor; hook'ların
 * kendisi React ve ağ gerektiriyor, onlar telefonda doğrulanıyor.
 *
 * Bu iki şeyin sessizce bozulması pahalı: yanlış kurulan sorgu dizesi filtreyi
 * görmezden gelir (liste doğru görünür ama yanlıştır), tutarsız anahtar ise
 * aynı veriyi iki kez çektirir ve ileride çevrimdışı önbelleğini böler.
 */
describe("buildListQuery", () => {
  it("sayfa ve limit her zaman gider", () => {
    const q = buildListQuery({}, 1);
    expect(q).toContain("page=1");
    expect(q).toContain("limit=20");
  });

  it("verilmeyen filtreyi hiç göndermez", () => {
    // Boş bir `type=` göndermek sunucuda "tipi boş olanlar" gibi
    // yorumlanabilirdi; parametre hiç bulunmamalı.
    const q = buildListQuery({ region: "Islay" }, 2);
    expect(q).toContain("region=Islay");
    expect(q).not.toContain("type=");
    expect(q).not.toContain("search=");
    expect(q).toContain("page=2");
  });

  it("boşluk ve özel karakterleri kodlar", () => {
    const q = buildListQuery({ search: "Highland Park" }, 1);
    expect(q).toContain("search=Highland+Park");
  });

  it("tüm filtreleri birlikte taşır", () => {
    const q = buildListQuery({ search: "x", type: "Single Malt", region: "Islay", country: "Scotland" }, 3);
    for (const part of ["search=x", "type=Single+Malt", "region=Islay", "country=Scotland", "page=3"]) {
      expect(q).toContain(part);
    }
  });
});

describe("queryKeys", () => {
  it("aynı filtreler aynı anahtarı üretir", () => {
    const a = queryKeys.whiskeys.list({ region: "Islay" });
    const b = queryKeys.whiskeys.list({ region: "Islay" });
    expect(a).toEqual(b);
  });

  it("farklı filtreler farklı anahtar üretir", () => {
    const a = queryKeys.whiskeys.list({ region: "Islay" });
    const b = queryKeys.whiskeys.list({ region: "Speyside" });
    expect(a).not.toEqual(b);
  });

  it("liste, detay ve facet anahtarları ortak kökten gelir", () => {
    // Kök ortak olmalı ki ileride tüm katalog önbelleği tek hamlede
    // geçersizleştirilebilsin.
    expect(queryKeys.whiskeys.list({})[0]).toBe("whiskeys");
    expect(queryKeys.whiskeys.detail("x")[0]).toBe("whiskeys");
    expect(queryKeys.whiskeys.facets()[0]).toBe("whiskeys");
  });
});
