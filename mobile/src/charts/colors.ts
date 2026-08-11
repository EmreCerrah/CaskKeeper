/**
 * @file colors.ts
 * @description Aroma kategorilerinin grafik renkleri.
 *
 * Web'deki CATEGORY_CHART_COLORS'ın kopyası. Aroma ETİKETLERİNİN
 * kopyalanmaması kuralı (bkz. data/aromaWheel.ts) burada geçerli değil: orada
 * risk iki istemcinin veritabanına farklı METİN yazmasıydı. Renk hiçbir yere
 * yazılmıyor, yalnızca çizim tercihi — uç noktadan indirmek boşuna istek olurdu.
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

/** Tanınmayan kategori nötr griye düşer — grafik yine de çizilir. */
export const FALLBACK_CHART_COLOR = "#898781";

export function categoryColor(category: string): string {
  return CATEGORY_CHART_COLORS[category] ?? FALLBACK_CHART_COLOR;
}
