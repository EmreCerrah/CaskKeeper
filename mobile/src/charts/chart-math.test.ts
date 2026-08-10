import { describe, it, expect } from "vitest";
import { distributionBars, trendLegend, trendSegments } from "./chart-math";
import type { FlavorTrendPoint } from "../data/dashboard";

/**
 * Grafik hesabı sessizce bozulur: yanlış bir yüzde hata vermez, sadece yanlış
 * bir resim çizer. Sıfır ve boş durumlar özellikle sınanıyor — yeni bir hesapta
 * ilk not yazılmadan önce her sayı sıfırdır.
 */
describe("distributionBars", () => {
  it("en büyük öğe tam genişlikte, diğerleri ona oranlı", () => {
    const bars = distributionBars([
      { label: "Single Malt", count: 10 },
      { label: "Blended", count: 5 },
      { label: "Bourbon", count: 1 },
    ]);

    expect(bars.map((b) => b.widthPct)).toEqual([100, 50, 10]);
    expect(bars.map((b) => b.key)).toEqual(["Single Malt", "Blended", "Bourbon"]);
  });

  it("sayılar olduğu gibi taşınır", () => {
    expect(distributionBars([{ label: "Islay", count: 3 }])[0].count).toBe(3);
  });

  it("boş liste boş sonuç verir", () => {
    expect(distributionBars([])).toEqual([]);
  });

  it("hepsi sıfırsa NaN değil sıfır genişlik üretir", () => {
    // Sıfıra bölme NaN üretirdi ve React Native bar'ı hiç çizmezdi.
    const bars = distributionBars([{ label: "Bilinmeyen", count: 0 }]);
    expect(bars[0].widthPct).toBe(0);
  });
});

describe("trendSegments", () => {
  const point: FlavorTrendPoint = {
    period: "2026-03",
    total: 4,
    categories: [
      { category: "fruity", count: 3 },
      { category: "smoky_peaty", count: 1 },
    ],
  };

  it("segmentler o ayın toplamına göre ölçeklenir ve barı tam doldurur", () => {
    const segments = trendSegments(point);

    expect(segments.map((s) => s.widthPct)).toEqual([75, 25]);
    expect(segments.reduce((acc, s) => acc + s.widthPct, 0)).toBe(100);
  });

  it("payda sunucunun `total` alanı değil kategorilerin gerçek toplamı", () => {
    // `total` kategorilerle tutarsız gelirse bar taşar ya da eksik kalırdı.
    const inconsistent: FlavorTrendPoint = {
      period: "2026-04",
      total: 99,
      categories: [
        { category: "sweet", count: 1 },
        { category: "woody", count: 1 },
      ],
    };

    expect(trendSegments(inconsistent).map((s) => s.widthPct)).toEqual([50, 50]);
  });

  it("kategorisi olmayan ya da hepsi sıfır olan ay boş döner", () => {
    expect(trendSegments({ period: "2026-05", total: 0, categories: [] })).toEqual([]);
    expect(
      trendSegments({ period: "2026-05", total: 0, categories: [{ category: "sweet", count: 0 }] })
    ).toEqual([]);
  });
});

describe("trendLegend", () => {
  it("kategorileri ilk görüldükleri ayın sırasına göre toplar", () => {
    const trend: FlavorTrendPoint[] = [
      {
        period: "2026-01",
        total: 2,
        categories: [
          { category: "sweet", count: 1 },
          { category: "fruity", count: 1 },
        ],
      },
      {
        period: "2026-02",
        total: 2,
        categories: [
          { category: "fruity", count: 1 },
          { category: "woody", count: 1 },
        ],
      },
    ];

    // Alfabetik olsaydı fruity başa gelirdi; lejant segment sırasını takip
    // etmeli ki renkler soldan sağa eşleşsin.
    expect(trendLegend(trend)).toEqual(["sweet", "fruity", "woody"]);
  });

  it("aynı kategoriyi bir kez sayar", () => {
    const trend: FlavorTrendPoint[] = [
      { period: "2026-01", total: 1, categories: [{ category: "sweet", count: 1 }] },
      { period: "2026-02", total: 1, categories: [{ category: "sweet", count: 1 }] },
    ];

    expect(trendLegend(trend)).toEqual(["sweet"]);
  });

  it("boş trend boş lejant verir", () => {
    expect(trendLegend([])).toEqual([]);
  });
});
