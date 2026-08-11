import { StyleSheet, Text, View } from "react-native";
import { categoryColor } from "../../charts/colors";
import { trendLegend, trendSegments } from "../../charts/chart-math";
import type { FlavorTrendPoint } from "../../data/dashboard";
import { aromaCategoryKey } from "../../i18n/aroma";
import { formatPeriod } from "../../i18n/period";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface FlavorTrendChartProps {
  trend: FlavorTrendPoint[];
}

/**
 * Aylık aroma dağılımı — her ay bir yığılmış yatay bar.
 *
 * Web'de segment değerleri hover tooltip'iyle okunuyor; mobilde hover yok ve
 * parmakla birkaç piksellik bir segmenti seçmek de mümkün değil. Karar
 * (kullanıcıyla konuşuldu): segment başına sayı gösterilmiyor, grafik oranı
 * anlatıyor. Ay satırındaki toplam duruyor — o segment değeri değil, barın kaç
 * etikete dayandığını söylüyor.
 *
 * Ekran okuyucu barı tek bir görsel olarak okur (accessibilityLabel), yoksa
 * dokuz renk kutusunu tek tek gezerdi.
 */
export function FlavorTrendChart({ trend }: FlavorTrendChartProps) {
  if (trend.length === 0) {
    return <Text style={styles.empty}>{t("trend.empty")}</Text>;
  }

  const legend = trendLegend(trend);

  return (
    <View style={styles.wrapper}>
      <View style={styles.legend}>
        {legend.map((category) => (
          <View key={category} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: categoryColor(category) }]} />
            <Text style={styles.legendText}>{t(aromaCategoryKey(category))}</Text>
          </View>
        ))}
      </View>

      <View style={styles.months}>
        {trend.map((point) => {
          const label = formatPeriod(point.period, t);
          const segments = trendSegments(point);

          return (
            <View key={point.period} style={styles.month}>
              <View style={styles.monthRow}>
                <Text style={styles.monthLabel}>{label}</Text>
                <Text style={styles.monthTotal}>{t("trend.tagCount", { count: point.total })}</Text>
              </View>

              <View
                style={styles.bar}
                accessibilityRole="image"
                accessibilityLabel={t("trend.barLabel", { period: label, count: point.total })}
              >
                {segments.map((segment, index) => (
                  <View
                    key={segment.key}
                    style={[
                      styles.segment,
                      {
                        backgroundColor: categoryColor(segment.key),
                        width: `${segment.widthPct}%`,
                      },
                      // Komşu iki kategori benzer tonda olabiliyor; ince bir
                      // ayırıcı sınırı görünür kılıyor, genişliği bozmadan.
                      index < segments.length - 1 && styles.segmentDivider,
                    ]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 14 },
  legend: { columnGap: 14, flexDirection: "row", flexWrap: "wrap", rowGap: 6 },
  legendItem: { alignItems: "center", flexDirection: "row", gap: 6 },
  swatch: { borderRadius: 3, height: 10, width: 10 },
  legendText: { color: theme.textMuted, fontSize: 12 },
  months: { gap: 10 },
  month: { gap: 4 },
  monthRow: { flexDirection: "row", justifyContent: "space-between" },
  monthLabel: { color: theme.text, fontSize: 13 },
  monthTotal: { color: theme.textMuted, fontSize: 12 },
  bar: {
    backgroundColor: theme.border,
    borderRadius: 5,
    flexDirection: "row",
    height: 20,
    overflow: "hidden",
  },
  segment: { height: "100%" },
  segmentDivider: { borderRightColor: theme.surface, borderRightWidth: 1 },
  empty: { color: theme.textMuted, fontSize: 13, lineHeight: 19 },
});
