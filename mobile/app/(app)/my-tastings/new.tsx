import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TastingNoteForm } from "../../../src/components/tasting/TastingNoteForm";
import { toNotePayload, type NoteFormState } from "../../../src/data/note-payload";
import { useCreateNote } from "../../../src/data/tastingNotes";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

/**
 * A new tasting note.
 *
 * The whisky is chosen in the catalogue: this screen is reached with a
 * `whiskeyId` (the "Add tasting note" button on the whisky detail). Whisky
 * search is not rebuilt here — the catalogue already does that job.
 */
export default function NewNoteScreen() {
  const router = useRouter();
  const { whiskeyId, whiskeyLabel } = useLocalSearchParams<{ whiskeyId: string; whiskeyLabel?: string }>();
  const createNote = useCreateNote();
  const [error, setError] = useState<string | null>(null);

  const initial: NoteFormState = {
    whiskeyId: whiskeyId ?? "",
    tastingDate: new Date(),
    rating: 80,
    noseTags: [],
    noseNotes: "",
    palateTags: [],
    palateNotes: "",
    finishTags: [],
    finishNotes: "",
    finishLength: "medium",
    personalNotes: "",
    visibility: "private",
    isFavorite: false,
  };

  async function handleSubmit(form: NoteFormState) {
    setError(null);
    try {
      await createNote.mutateAsync(toNotePayload(form));
      router.replace("/(app)/my-tastings");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("notes.saveFailed"));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t("notes.newTitle")}</Text>
      {whiskeyLabel ? <Text style={styles.subtitle}>{whiskeyLabel}</Text> : null}

      <TastingNoteForm
        initial={initial}
        submitLabel={t("notes.save")}
        busy={createNote.isPending}
        error={error}
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 6, padding: 16, paddingBottom: 48 },
  title: { color: theme.text, fontSize: 24, fontWeight: "700" },
  subtitle: { color: theme.textMuted, fontSize: 14, marginBottom: 10 },
});
