import { ScrollView, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TastingNoteForm } from "../../../src/components/tasting/TastingNoteForm";
import { pendingNoteId } from "../../../src/data/note-cache";
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
 *
 * The brand and the name arrive as separate parameters rather than one joined
 * label, because a note waiting to be sent is drawn from them: the card shows
 * the brand and the name in different places, and splitting a joined string
 * back apart would guess wrong on the first whisky with a space in its brand.
 */
export default function NewNoteScreen() {
  const router = useRouter();
  const { whiskeyId, whiskeyBrand, whiskeyName } = useLocalSearchParams<{
    whiskeyId: string;
    whiskeyBrand?: string;
    whiskeyName?: string;
  }>();
  const createNote = useCreateNote();

  const whiskeyLabel = [whiskeyBrand, whiskeyName].filter(Boolean).join(" ");

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

  /**
   * Deliberately NOT awaited.
   *
   * With no connection the request pauses instead of failing, so awaiting it
   * would leave this form spinning until the signal came back — for as long as
   * that takes. The note is put into the list optimistically, so leaving for it
   * immediately shows the user their note either way; whether it has reached
   * the server is the card's business, not the form's.
   *
   * The cost is that a rejection no longer surfaces here. It surfaces on the
   * card instead, with the reason, which is the only place that still works
   * when the answer arrives an hour later.
   */
  function handleSubmit(form: NoteFormState) {
    createNote.mutate({
      input: toNotePayload(form),
      whiskey: { id: whiskeyId ?? "", brand: whiskeyBrand ?? "", name: whiskeyName ?? "" },
      pendingId: pendingNoteId(String(Date.now())),
    });

    router.replace("/(app)/my-tastings");
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t("notes.newTitle")}</Text>
      {whiskeyLabel ? <Text style={styles.subtitle}>{whiskeyLabel}</Text> : null}

      {/* No `error` prop: the screen leaves as soon as the note is queued, so
          there is nowhere here for a later refusal to land. It appears on the
          note's own card instead. */}
      <TastingNoteForm
        initial={initial}
        submitLabel={t("notes.save")}
        busy={createNote.isPending}
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
