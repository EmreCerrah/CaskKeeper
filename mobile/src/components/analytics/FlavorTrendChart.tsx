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
 * Monthly aroma distribution — one stacked horizontal bar per month.
 *
 * On the web the segment values are read from a hover tooltip; there is no
 * hover on mobile, and a segment a few pixels wide cannot be hit with a
 * finger. The decision (agreed with the user): no per-segment numbers, the
 * chart carries the proportion. The total on the month row stays — that is not
 * a segment value, it says how many tags the bar rests on.
 *
 * A screen reader reads the bar as a single image (accessibilityLabel);
 * otherwise it would step through nine coloured boxes one by one.
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
                      // Two neighbouring categories can be close in tone; a
                      // hairline divider makes the boundary visible without
                      // disturbing the widths.
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
