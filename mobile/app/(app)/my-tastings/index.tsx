import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/Button";
import { NoteCard } from "../../../src/components/tasting/NoteCard";
import { useDiscardPendingNote, useMyNotes, type TastingNote } from "../../../src/data/tastingNotes";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

export default function MyTastingsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useMyNotes();
  const discardNote = useDiscardPendingNote();

  const notes = data?.data ?? [];

  /**
   * A note the server has never seen has no page to open: the detail screen
   * fetches by id, and this id does not exist yet. Rather than let the tap
   * land on an error, each local state answers for itself.
   */
  function openNote(note: TastingNote) {
    if (note.localStatus === "pending") {
      Alert.alert(t("notes.pending"), t("notes.pendingHint"));
      return;
    }

    if (note.localStatus === "failed") {
      Alert.alert(t("notes.failed"), note.localError ?? t("notes.saveFailed"), [
        { text: t("notes.keep"), style: "cancel" },
        // The only way out of a note that can never be sent. Without it the row
        // would sit in the list for good.
        { text: t("notes.discard"), style: "destructive", onPress: () => discardNote(note.id) },
      ]);
      return;
    }

    router.push(`/(app)/my-tastings/${note.id}`);
  }

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
          renderItem={({ item }) => <NoteCard note={item} onPress={() => openNote(item)} />}
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
