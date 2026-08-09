import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { FeedNoteCard } from "../../../src/components/social/FeedNoteCard";
import { useFeed } from "../../../src/data/feed";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

export default function FeedScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed();

  const notes = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("feed.title")}</Text>
        <Pressable
          onPress={() => router.push("/(app)/akis/kisiler")}
          accessibilityRole="button"
          style={styles.headerAction}
        >
          <Text style={styles.headerActionText}>{t("people.title")}</Text>
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Text style={styles.error}>{error instanceof Error ? error.message : t("error.unexpected")}</Text>
          <View style={styles.retry}>
            <Button label={t("catalogue.retry")} onPress={() => refetch()} />
          </View>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={notes}
          keyExtractor={(note) => note.id}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isRefetching}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          renderItem={({ item }) => (
            <FeedNoteCard
              note={item}
              onPress={() => router.push(`/(app)/akis/not/${item.id}`)}
              onAuthorPress={() => item.author && router.push(`/(app)/akis/kullanici/${item.author.id}`)}
            />
          )}
          ListEmptyComponent={
            // Boş akış "kimseyi takip etmiyorsun" demek — doğal giriş noktası.
            <View style={styles.center}>
              <Text style={styles.empty}>{t("feed.empty")}</Text>
              <Text style={styles.emptyHint}>{t("feed.emptyHint")}</Text>
              <View style={styles.retry}>
                <Button label={t("feed.findPeople")} onPress={() => router.push("/(app)/akis/kisiler")} />
              </View>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={theme.primary} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: { color: theme.text, fontSize: 26, fontWeight: "700" },
  headerAction: { justifyContent: "center", minHeight: 44, paddingHorizontal: 4 },
  headerActionText: { color: theme.primary, fontSize: 15, fontWeight: "600" },
  list: { gap: 10, padding: 16 },
  center: { alignItems: "center", gap: 8, padding: 32 },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  retry: { marginTop: 8, minWidth: 180 },
  empty: { color: theme.text, fontSize: 16 },
  emptyHint: { color: theme.textMuted, fontSize: 13, textAlign: "center" },
  footer: { padding: 16 },
});
