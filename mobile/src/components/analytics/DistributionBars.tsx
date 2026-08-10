import { StyleSheet, Text, View } from "react-native";
import { distributionBars } from "../../charts/chart-math";
import type { DistributionItem } from "../../data/dashboard";
import { theme } from "../../theme";

interface DistributionBarsProps {
  items: DistributionItem[];
  emptyLabel: string;
}

/**
 * Tek serili yatay bar listesi (tip / bölge / damıtımevi dağılımı).
 *
 * Web'deki DistributionBars'ın karşılığı, düz View'larla — mobilde grafik
 * kütüphanesi eklenmedi. Tek renk kullanıldığı için lejant gerekmiyor: renk
 * kategorik bir kimlik taşımıyor, her satırın sayısı zaten yanında yazıyor.
 */
export function DistributionBars({ items, emptyLabel }: DistributionBarsProps) {
  if (items.length === 0) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.list}>
      {distributionBars(items).map((bar) => (
        <View key={bar.key} style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={styles.label} numberOfLines={1}>
              {bar.key}
            </Text>
            <Text style={styles.count}>{bar.count}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${bar.widthPct}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { gap: 5 },
  labelRow: { alignItems: "baseline", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  label: { color: theme.text, flexShrink: 1, fontSize: 14 },
  count: { color: theme.textMuted, fontSize: 13 },
  track: {
    backgroundColor: theme.border,
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  fill: { backgroundColor: theme.primary, borderRadius: 999, height: "100%" },
  empty: { color: theme.textMuted, fontSize: 13, lineHeight: 19 },
});
