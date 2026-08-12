import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LikeButton } from "../../../../src/components/social/LikeButton";
import { NoteComments } from "../../../../src/components/social/NoteComments";
import { WhiskeyImage } from "../../../../src/components/WhiskeyImage";
import { useNote } from "../../../../src/data/tastingNotes";
import type { FeedNote } from "../../../../src/data/feed";
import { t } from "../../../../src/i18n";
import { theme } from "../../../../src/theme";

/**
 * The public view of a tasting note.
 *
 * There is NO editing here: editing your own note lives in `my-tastings/[id]`.
 * This screen opens from the feed and from profiles, so the note may belong to
 * someone else. The server already enforces "public, or yours".
 */
export default function PublicNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, error } = useNote(id ?? "");
  const note = data as FeedNote | undefined;

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

  const whiskey = note.whiskey;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <WhiskeyImage
          uri={whiskey?.imageUrl}
          fallbackText={`${whiskey?.brand ?? ""} ${whiskey?.name ?? ""}`}
          size={120}
        />
        <Text style={styles.brand}>{whiskey?.brand}</Text>
        <Text style={styles.name}>{whiskey?.name}</Text>
        {note.author && <Text style={styles.author}>{t("note.byAuthor", { name: note.author.name })}</Text>}
        <Text style={styles.rating}>{note.rating}</Text>
        <Text style={styles.date}>{new Date(note.tastingDate).toLocaleDateString()}</Text>
      </View>

      <LikeButton
        noteId={note.id}
        liked={note.interactions?.isLikedByViewer ?? false}
        count={note.interactions?.likeCount ?? 0}
      />

      <TagSection title={t("note.nose")} tags={note.noseTags} notes={note.noseNotes} />
      <TagSection title={t("note.palate")} tags={note.palateTags} notes={note.palateNotes} />
      <TagSection title={t("note.finish")} tags={note.finishTags} notes={note.finishNotes} />

      {note.personalNotes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("note.personal")}</Text>
          <View style={styles.sectionBody}>
            <Text style={styles.paragraph}>{note.personalNotes}</Text>
          </View>
        </View>
      ) : null}

      <NoteComments noteId={note.id} />
    </ScrollView>
  );
}

function TagSection({ title, tags, notes }: { title: string; tags: string[]; notes?: string }) {
  if (tags.length === 0 && !notes) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        {notes ? <Text style={styles.paragraph}>{notes}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, padding: 16, paddingBottom: 40 },
  center: { alignItems: "center", backgroundColor: theme.background, flex: 1, justifyContent: "center", padding: 32 },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  hero: { alignItems: "center", gap: 4 },
  brand: { color: theme.primary, fontSize: 14, fontWeight: "600", marginTop: 8 },
  name: { color: theme.text, fontSize: 22, fontWeight: "700", textAlign: "center" },
  author: { color: theme.textMuted, fontSize: 13 },
  rating: { color: theme.primary, fontSize: 34, fontWeight: "700", marginTop: 6 },
  date: { color: theme.textMuted, fontSize: 12 },
  section: { gap: 8 },
  sectionTitle: { color: theme.text, fontSize: 16, fontWeight: "700" },
  sectionBody: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { color: theme.text, fontSize: 13 },
  paragraph: { color: theme.text, fontSize: 14, lineHeight: 21 },
});
