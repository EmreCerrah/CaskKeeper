import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../../src/components/Button";
import { WhiskeyCard } from "../../../src/components/WhiskeyCard";
import { useWishlist } from "../../../src/data/wishlist";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

/**
 * My Wishlist — the whiskies you mean to try.
 *
 * There is NO remove button here: tapping a whisky opens the catalogue detail,
 * where adding and removing already live in one place. Two buttons in two
 * places would both have to reflect the same state.
 */
export default function WishlistScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useWishlist();

  const items = data?.data ?? [];

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
      data={items}
      keyExtractor={(item) => item.whiskey.id}
      contentContainerStyle={styles.list}
      onRefresh={refetch}
      refreshing={isRefetching}
      ListHeaderComponent={
        items.length > 0 ? (
          <Text style={styles.count}>{t("wishlist.count", { count: data?.total ?? 0 })}</Text>
        ) : null
      }
      renderItem={({ item }) => (
        <WhiskeyCard
          whiskey={item.whiskey}
          onPress={() => router.push(`/(app)/catalogue/${item.whiskey.slug}`)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>{t("wishlist.empty")}</Text>
          <Text style={styles.emptyHint}>{t("wishlist.emptyHint")}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  list: { gap: 10, padding: 16, paddingBottom: 48 },
  center: { alignItems: "center", backgroundColor: theme.background, flex: 1, gap: 8, justifyContent: "center", padding: 32 },
  count: { color: theme.textMuted, fontSize: 14, marginBottom: 4 },
  empty: { color: theme.text, fontSize: 16, textAlign: "center" },
  emptyHint: { color: theme.textMuted, fontSize: 13, lineHeight: 19, textAlign: "center" },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  retry: { marginTop: 8, minWidth: 160 },
});
