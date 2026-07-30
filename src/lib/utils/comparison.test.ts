/**
 * comparison.ts testleri.
 *
 * Odak: URL'den gelen güvenilmeyen `viski` parametresinin doğru
 * ayrıştırılması (tek/çoklu değer, yinelenen, üst sınır) ve ortak aroma
 * kesişiminin sınır durumları.
 */

import { describe, it, expect } from "vitest";
import {
  MAX_COMPARE_ITEMS,
  parseCompareSlugs,
  findSharedFlavors,
  buildCompareHref,
} from "./comparison";

describe("parseCompareSlugs", () => {
  it("parametre yoksa boş liste döner", () => {
    expect(parseCompareSlugs(undefined)).toEqual([]);
  });

  it("tek string değeri listeye çevirir", () => {
    expect(parseCompareSlugs("lagavulin-16")).toEqual(["lagavulin-16"]);
  });

  it("çoklu değeri sırasını koruyarak döner", () => {
    expect(parseCompareSlugs(["a", "b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("yinelenen slug'ları atar", () => {
    expect(parseCompareSlugs(["a", "b", "a"])).toEqual(["a", "b"]);
  });

  it("üst sınırı aşan slug'ları kırpar", () => {
    expect(parseCompareSlugs(["a", "b", "c", "d", "e"])).toEqual(["a", "b", "c"]);
    expect(parseCompareSlugs(["a", "b", "c", "d"]).length).toBe(MAX_COMPARE_ITEMS);
  });

  it("boş ve yalnızca boşluktan oluşan değerleri atar", () => {
    expect(parseCompareSlugs(["a", "", "   ", "b"])).toEqual(["a", "b"]);
  });

  it("slug'ların baş/son boşluklarını kırpar", () => {
    expect(parseCompareSlugs("  lagavulin-16  ")).toEqual(["lagavulin-16"]);
  });
});

describe("findSharedFlavors", () => {
  it("hiç profil yoksa boş küme döner", () => {
    expect(findSharedFlavors([]).size).toBe(0);
  });

  it("tek viskide kesişim anlamsızdır, boş küme döner", () => {
    expect(findSharedFlavors([["oak", "honey"]]).size).toBe(0);
  });

  it("iki viskinin ortak terimlerini bulur", () => {
    const shared = findSharedFlavors([
      ["oak", "honey", "smoke"],
      ["oak", "vanilla", "honey"],
    ]);

    expect(Array.from(shared).sort()).toEqual(["honey", "oak"]);
  });

  it("üç viskide yalnızca hepsinde bulunan terimi döner", () => {
    const shared = findSharedFlavors([
      ["oak", "honey", "smoke"],
      ["oak", "honey", "vanilla"],
      ["oak", "pepper"],
    ]);

    expect(Array.from(shared)).toEqual(["oak"]);
  });

  it("ortak terim yoksa boş küme döner", () => {
    const shared = findSharedFlavors([
      ["oak", "honey"],
      ["peat", "smoke"],
    ]);

    expect(shared.size).toBe(0);
  });

  it("bir profil boşsa kesişim boştur", () => {
    expect(findSharedFlavors([["oak"], []]).size).toBe(0);
  });
});

describe("buildCompareHref", () => {
  it("boş listede parametresiz yol döner", () => {
    expect(buildCompareHref([])).toBe("/karsilastir");
  });

  it("her slug için tekrar eden parametre üretir", () => {
    expect(buildCompareHref(["a", "b"])).toBe("/karsilastir?viski=a&viski=b");
  });

  it("URL'de güvenli olmayan karakterleri kodlar", () => {
    expect(buildCompareHref(["a b"])).toBe("/karsilastir?viski=a+b");
  });
});
