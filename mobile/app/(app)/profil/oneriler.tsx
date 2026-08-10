import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../../src/components/Button";
import { WhiskeyCard } from "../../../src/components/WhiskeyCard";
import { MatchInfo } from "../../../src/components/recommendations/MatchInfo";
import { useRecommendations } from "../../../src/data/dashboard";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

/**
 * Öneriler — damak profiline göre henüz tadılmamış viskiler.
 *
 * Kart, katalogdaki WhiskeyCard'ın kendisi; eşleşme bilgisi footer olarak
 * geçiyor. Dokununca katalog sekmesindeki detaya gidiyor: viskinin künyesi
 * zaten orada, ikinci bir detay ekranı kopyalanmadı.
 */
export default function RecommendationsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useRecommendations();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error instanceof Error ? error.message : t("error.unexpected")}</Text>
        <View style={styles.retry}>
          <Button label={t("catalogue.retry")} onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.flex}
      data={data ?? []}
      keyExtractor={(rec) => rec.whiskey.id}
      contentContainerStyle={styles.list}
      onRefresh={refetch}
      refreshing={isRefetching}
      ListHeaderComponent={<Text style={styles.subtitle}>{t("recommendations.subtitle")}</Text>}
      renderItem={({ item }) => (
        <WhiskeyCard
          whiskey={item.whiskey}
          onPress={() => router.push(`/(app)/katalog/${item.whiskey.slug}`)}
          footer={<MatchInfo score={item.score} matchedCategories={item.matchedCategories} />}
        />
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>{t("recommendations.empty")}</Text>
          <Text style={styles.emptyHint}>{t("recommendations.emptyHint")}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  list: { gap: 10, padding: 16, paddingBottom: 48 },
  center: { alignItems: "center", backgroundColor: theme.background, flex: 1, gap: 8, justifyContent: "center", padding: 32 },
  subtitle: { color: theme.textMuted, fontSize: 14, marginBottom: 4 },
  empty: { color: theme.text, fontSize: 16, textAlign: "center" },
  emptyHint: { color: theme.textMuted, fontSize: 13, lineHeight: 19, textAlign: "center" },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  retry: { marginTop: 8, minWidth: 160 },
});
