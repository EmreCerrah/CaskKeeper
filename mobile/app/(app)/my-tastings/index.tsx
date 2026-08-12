import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { NoteCard } from "../../../src/components/tasting/NoteCard";
import { useMyNotes } from "../../../src/data/tastingNotes";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

export default function MyTastingsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useMyNotes();

  const notes = data?.data ?? [];

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("notes.title")}</Text>
        {!isLoading && !isError && (
          <Text style={styles.count}>{t("notes.count", { count: data?.total ?? 0 })}</Text>
        )}
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
          renderItem={({ item }) => (
            <NoteCard note={item} onPress={() => router.push(`/(app)/my-tastings/${item.id}`)} />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>{t("notes.empty")}</Text>
              <Text style={styles.emptyHint}>{t("notes.emptyHint")}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  header: { paddingHorizontal: 16, paddingTop: 12 },
  title: { color: theme.text, fontSize: 26, fontWeight: "700" },
  count: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  list: { gap: 10, padding: 16 },
  center: { alignItems: "center", gap: 8, padding: 32 },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  retry: { marginTop: 8, minWidth: 160 },
  empty: { color: theme.text, fontSize: 16 },
  emptyHint: { color: theme.textMuted, fontSize: 13, textAlign: "center" },
});
