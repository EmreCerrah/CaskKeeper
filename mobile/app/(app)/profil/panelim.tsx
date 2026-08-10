import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../../src/components/Button";
import { Section } from "../../../src/components/Section";
import { DistributionBars } from "../../../src/components/analytics/DistributionBars";
import { FlavorTrendChart } from "../../../src/components/analytics/FlavorTrendChart";
import { useAnalytics, useDashboard } from "../../../src/data/dashboard";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

/**
 * Panelim — kendi tadım istatistiklerin.
 *
 * Web'deki /panel ve /panel/istatistikler tek ekranda birleşti: telefonda iki
 * ayrı sayfa arasında gidip gelmek yerine tek kaydırma daha az iş.
 *
 * Web'deki "Son Tadımlarınız" listesi burada YOK — Tadımlarım sekmesi zaten
 * aynı listeyi gösteriyor.
 */
export default function DashboardScreen() {
  const dashboard = useDashboard();
  const analytics = useAnalytics();

  const isLoading = dashboard.isLoading || analytics.isLoading;
  // İki sorgudan biri düşse de ekranın tamamı hata gösteriyor: yarısı dolu
  // yarısı boş bir panel, kullanıcının hangi sayının güncel olduğunu
  // anlayamayacağı bir durum bırakırdı.
  const error = dashboard.error ?? analytics.error;
  const isRefetching = dashboard.isRefetching || analytics.isRefetching;

  function refetch() {
    dashboard.refetch();
    analytics.refetch();
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error instanceof Error ? error.message : t("error.unexpected")}</Text>
        <View style={styles.retry}>
          <Button label={t("catalogue.retry")} onPress={refetch} />
        </View>
      </View>
    );
  }

  const stats = dashboard.data;
  const distribution = analytics.data?.distribution;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />
      }
    >
      <Text style={styles.subtitle}>{t("dashboard.subtitle")}</Text>

      <View style={styles.statGrid}>
        <StatCard icon="create-outline" label={t("dashboard.statTotal")} value={String(stats?.totalNotes ?? 0)} />
        <StatCard
          icon="wine-outline"
          label={t("dashboard.statDistinct")}
          value={String(stats?.distinctWhiskeys ?? 0)}
        />
        <StatCard
          icon="star-outline"
          label={t("dashboard.statAverage")}
          value={stats?.averageRating != null ? String(stats.averageRating) : "—"}
        />
        <StatCard
          icon="heart-outline"
          label={t("dashboard.statFavorites")}
          value={String(stats?.favoriteCount ?? 0)}
        />
      </View>

      <Section title={t("dashboard.palateProfile")}>
        <Text style={styles.sectionCaption}>{t("dashboard.topFlavors")}</Text>
        {stats && stats.topFlavorTags.length > 0 ? (
          <View style={styles.tags}>
            {stats.topFlavorTags.map((item) => (
              // Etiket metni ÇEVRİLMİYOR: veritabanına yazıldığı haliyle
              // duruyor (bkz. data/aromaWheel.ts).
              <Text key={item.tag} style={styles.tag}>
                {item.tag} · {item.count}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>{t("dashboard.noFlavors")}</Text>
        )}
      </Section>

      <Section title={t("stats.trendTitle")}>
        <FlavorTrendChart trend={analytics.data?.flavorTrend ?? []} />
      </Section>

      <Section title={t("stats.byType")}>
        <DistributionBars items={distribution?.byType ?? []} emptyLabel={t("stats.empty")} />
      </Section>

      <Section title={t("stats.byRegion")}>
        <DistributionBars items={distribution?.byRegion ?? []} emptyLabel={t("stats.empty")} />
      </Section>

      <Section title={t("stats.topDistilleries")}>
        <DistributionBars items={distribution?.byDistillery ?? []} emptyLabel={t("stats.empty")} />
      </Section>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={theme.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  content: { gap: 18, padding: 16, paddingBottom: 48 },
  center: { alignItems: "center", backgroundColor: theme.background, flex: 1, gap: 8, justifyContent: "center", padding: 32 },
  subtitle: { color: theme.textMuted, fontSize: 14 },
  // İki sütun: dört kart 2×2 diziliyor, dar telefonlarda da sayı okunur kalıyor.
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    flexGrow: 1,
    flexBasis: "45%",
    gap: 2,
    padding: 14,
  },
  statValue: { color: theme.text, fontSize: 24, fontWeight: "700" },
  statLabel: { color: theme.textMuted, fontSize: 12 },
  sectionCaption: { color: theme.textMuted, fontSize: 13 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: theme.background,
    borderColor: theme.primary,
    borderRadius: 999,
    borderWidth: 1,
    color: theme.primary,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  empty: { color: theme.textMuted, fontSize: 13, lineHeight: 19 },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  retry: { marginTop: 8, minWidth: 160 },
});
