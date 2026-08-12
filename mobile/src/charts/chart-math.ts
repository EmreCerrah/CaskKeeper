import type { DistributionItem, FlavorTrendPoint } from "../data/dashboard";

/**
 * @file chart-math.ts
 * @description The width arithmetic behind the charts — PURE.
 *
 * Kept apart from the components: React Native modules cannot be loaded under
 * Node, yet this is exactly the part worth testing. A wrong percentage raises
 * no error, it just draws a wrong picture — the kind of bug a test has to
 * catch.
 *
 * The types arrive via `import type`, so they vanish at compile time; this
 * file imports nothing at runtime.
 */

export interface BarSlice {
  /** Category id or distribution label — also used as the React key. */
  key: string;
  count: number;
  /** Width as a percentage, 0-100. */
  widthPct: number;
}

/**
 * Bar widths for a distribution list — scaled to the LARGEST value.
 *
 * Not to the total: in a single-series list the largest item should fill the
 * width, otherwise eight distilleries all collapse into thin lines and the
 * comparison becomes unreadable.
 */
export function distributionBars(items: DistributionItem[]): BarSlice[] {
  const max = items.reduce((acc, item) => Math.max(acc, item.count), 0);

  return items.map((item) => ({
    key: item.label,
    count: item.count,
    // max === 0: the server should not return zero-count items, but if it
    // does, dividing by zero yields NaN and the bar is never drawn.
    widthPct: max > 0 ? (item.count / max) * 100 : 0,
  }));
}

/**
 * The stacked bar segments for one month — scaled to that month's TOTAL.
 *
 * Here the proportion is what matters: every month fills the full width, so
 * comparing months answers "which way did that month lean" rather than "which
 * month had more".
 */
export function trendSegments(point: FlavorTrendPoint): BarSlice[] {
  // `total` comes from the server but may disagree with the sum of the
  // categories (e.g. if one falls outside the top N). The real sum is used as
  // the denominator so the segments neither overflow the bar nor leave a gap.
  const sum = point.categories.reduce((acc, cat) => acc + cat.count, 0);

  if (sum <= 0) return [];

  return point.categories.map((cat) => ({
    key: cat.category,
    count: cat.count,
    widthPct: (cat.count / sum) * 100,
  }));
}

/**
 * The categories present in the chart, in order of the month they FIRST
 * appear in.
 *
 * Not alphabetical: the legend order should follow the segment order in the
 * chart, so the reader can match colours left to right.
 */
export function trendLegend(trend: FlavorTrendPoint[]): string[] {
  const seen: string[] = [];

  for (const point of trend) {
    for (const cat of point.categories) {
      if (!seen.includes(cat.category)) seen.push(cat.category);
    }
  }

  return seen;
}
