import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TastingNoteForm } from "../../../src/components/tasting/TastingNoteForm";
import { toNotePayload, type NoteFormState } from "../../../src/data/note-payload";
import type { FeedNote } from "../../../src/data/feed";
import { useDeleteNote, useNote, useUpdateNote } from "../../../src/data/tastingNotes";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

export default function EditNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const noteId = id ?? "";

  const { data: note, isLoading, isError, error } = useNote(noteId);
  const updateNote = useUpdateNote(noteId);
  const deleteNote = useDeleteNote();

  const [formError, setFormError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (isError || !note) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error instanceof Error ? error.message : t("error.unexpected")}</Text>
      </View>
    );
  }

  // The single-note response carries the interaction counts too (the same
  // body as the feed view); the TastingNote type does not model them, so it is
  // read as a FeedNote here.
  const commentCount = (note as FeedNote).interactions?.commentCount ?? 0;

  const initial: NoteFormState = {
    whiskeyId: note.whiskeyId,
    tastingDate: new Date(note.tastingDate),
    rating: note.rating,
    noseTags: note.noseTags,
    noseNotes: note.noseNotes ?? "",
    palateTags: note.palateTags,
    palateNotes: note.palateNotes ?? "",
    finishTags: note.finishTags,
    finishNotes: note.finishNotes ?? "",
    finishLength: note.finishLength,
    personalNotes: note.personalNotes ?? "",
    visibility: note.visibility,
    isFavorite: note.isFavorite,
  };

  async function handleSubmit(form: NoteFormState) {
    setFormError(null);
    try {
      // The whisky does not change on update — a note is a session recorded
      // against one whisky.
      const { whiskey: _whiskey, ...changes } = toNotePayload(form);
      await updateNote.mutateAsync(changes);
      router.replace("/(app)/my-tastings");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : t("notes.saveFailed"));
    }
  }

  async function handleDelete() {
    // Two steps: there is no way back, so one tap must not delete it.
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 4000);
      return;
    }

    setFormError(null);
    try {
      await deleteNote.mutateAsync(noteId);
      router.replace("/(app)/my-tastings");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : t("notes.deleteFailed"));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t("notes.editTitle")}</Text>
      {note.whiskey ? (
        <Text style={styles.subtitle}>{`${note.whiskey.brand} ${note.whiskey.name}`}</Text>
      ) : null}

      <TastingNoteForm
        initial={initial}
        submitLabel={t("notes.save")}
        busy={updateNote.isPending}
        error={formError}
        onSubmit={handleSubmit}
      />

      {/* Comments are not on this screen: it is an edit form, and a thread
          would split it in half. Without this link, comments on your own note
          would be unreachable on mobile. Public notes only — nobody can
          comment on a private one. */}
      {note.visibility === "public" && (
        <Pressable
          onPress={() => router.push(`/(app)/feed/note/${noteId}`)}
          style={styles.comments}
          accessibilityRole="button"
        >
          <Text style={styles.commentsText}>
            {t("comments.openPublic", { count: commentCount })}
          </Text>
        </Pressable>
      )}

      <Pressable onPress={handleDelete} style={styles.delete} accessibilityRole="button">
        <Text style={styles.deleteText}>
          {confirmingDelete ? t("notes.deleteConfirm") : t("notes.delete")}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 6, padding: 16, paddingBottom: 48 },
  center: { alignItems: "center", backgroundColor: theme.background, flex: 1, justifyContent: "center", padding: 32 },
  title: { color: theme.text, fontSize: 24, fontWeight: "700" },
  subtitle: { color: theme.textMuted, fontSize: 14, marginBottom: 10 },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  comments: { alignItems: "center", justifyContent: "center", marginTop: 8, minHeight: 48 },
  commentsText: { color: theme.primary, fontSize: 15, fontWeight: "600" },
  delete: { alignItems: "center", justifyContent: "center", marginTop: 8, minHeight: 48 },
  deleteText: { color: theme.danger, fontSize: 15, fontWeight: "600" },
});
