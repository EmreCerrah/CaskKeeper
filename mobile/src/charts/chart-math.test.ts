import { describe, it, expect } from "vitest";
import { distributionBars, trendLegend, trendSegments } from "./chart-math";
import type { FlavorTrendPoint } from "../data/dashboard";

/**
 * Chart arithmetic breaks quietly: a wrong percentage raises no error, it just
 * draws a wrong picture. The zero and empty cases are tested deliberately — on
 * a new account every number is zero until the first note is written.
 */
describe("distributionBars", () => {
  it("gives the largest item full width and scales the rest to it", () => {
    const bars = distributionBars([
      { label: "Single Malt", count: 10 },
      { label: "Blended", count: 5 },
      { label: "Bourbon", count: 1 },
    ]);

    expect(bars.map((b) => b.widthPct)).toEqual([100, 50, 10]);
    expect(bars.map((b) => b.key)).toEqual(["Single Malt", "Blended", "Bourbon"]);
  });

  it("carries the counts through unchanged", () => {
    expect(distributionBars([{ label: "Islay", count: 3 }])[0].count).toBe(3);
  });

  it("returns nothing for an empty list", () => {
    expect(distributionBars([])).toEqual([]);
  });

  it("produces zero width, not NaN, when everything is zero", () => {
    // Dividing by zero would produce NaN and React Native would not draw the
    // bar at all.
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

  it("scales segments to that month's total and fills the bar exactly", () => {
    const segments = trendSegments(point);

    expect(segments.map((s) => s.widthPct)).toEqual([75, 25]);
    expect(segments.reduce((acc, s) => acc + s.widthPct, 0)).toBe(100);
  });

  it("uses the real sum of the categories as the denominator, not the server's `total`", () => {
    // If `total` disagrees with the categories, the bar would overflow or
    // leave a gap.
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

  it("returns nothing for a month with no categories or all zeros", () => {
    expect(trendSegments({ period: "2026-05", total: 0, categories: [] })).toEqual([]);
    expect(
      trendSegments({ period: "2026-05", total: 0, categories: [{ category: "sweet", count: 0 }] })
    ).toEqual([]);
  });
});

describe("trendLegend", () => {
  it("collects categories in the order of the month they first appear in", () => {
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

    // Alphabetical would put fruity first; the legend has to follow the
    // segment order so the colours match left to right.
    expect(trendLegend(trend)).toEqual(["sweet", "fruity", "woody"]);
  });

  it("counts the same category once", () => {
    const trend: FlavorTrendPoint[] = [
      { period: "2026-01", total: 1, categories: [{ category: "sweet", count: 1 }] },
      { period: "2026-02", total: 1, categories: [{ category: "sweet", count: 1 }] },
    ];

    expect(trendLegend(trend)).toEqual(["sweet"]);
  });

  it("gives an empty legend for an empty trend", () => {
    expect(trendLegend([])).toEqual([]);
  });
});
