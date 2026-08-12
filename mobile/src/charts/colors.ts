/**
 * @file colors.ts
 * @description Chart colours for the aroma categories.
 *
 * A copy of the web's CATEGORY_CHART_COLORS. The rule against copying aroma
 * TAGS (see data/aromaWheel.ts) does not apply here: there, the risk was two
 * clients writing different TEXT to the database. A colour is never written
 * anywhere — it is purely a drawing choice, and fetching it from an endpoint
 * would be a wasted request.
 */
export const CATEGORY_CHART_COLORS: Record<string, string> = {
  fruity: "#3987e5",
  floral: "#d95926",
  woody: "#199e70",
  sweet: "#c98500",
  spicy: "#d55181",
  smoky_peaty: "#008300",
  nutty: "#9085e9",
  cereal: "#e66767",
  feinty_other: "#898781",
};

/** An unknown category falls back to neutral grey — the chart still draws. */
export const FALLBACK_CHART_COLOR = "#898781";

export function categoryColor(category: string): string {
  return CATEGORY_CHART_COLORS[category] ?? FALLBACK_CHART_COLOR;
}
