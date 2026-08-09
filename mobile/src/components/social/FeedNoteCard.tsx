import { Pressable, StyleSheet, Text, View } from "react-native";
import type { FeedNote } from "../../data/feed";
import { LikeButton } from "./LikeButton";
import { WhiskeyImage } from "../WhiskeyImage";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface FeedNoteCardProps {
  note: FeedNote;
  onPress: () => void;
  onAuthorPress: () => void;
}

/** Akıştaki tek tadım kartı. */
export function FeedNoteCard({ note, onPress, onAuthorPress }: FeedNoteCardProps) {
  const whiskey = note.whiskey;
  const interactions = note.interactions;

  return (
    <View style={styles.card}>
      {/* Yazara gitmek ayrı bir dokunuş hedefi: kartın tamamı nota gidiyor. */}
      <Pressable onPress={onAuthorPress} accessibilityRole="button" style={styles.author}>
        <WhiskeyImage uri={note.author?.profilePicture} fallbackText={note.author?.name ?? "?"} size={32} />
        <Text style={styles.authorName}>{note.author?.name ?? ""}</Text>
        <Text style={styles.date}>{new Date(note.tastingDate).toLocaleDateString()}</Text>
      </Pressable>

      <Pressable onPress={onPress} accessibilityRole="button" style={styles.body}>
        <View style={styles.head}>
          <View style={styles.titles}>
            <Text style={styles.brand} numberOfLines={1}>
              {whiskey?.brand ?? ""}
            </Text>
            <Text style={styles.name} numberOfLines={2}>
              {whiskey?.name ?? ""}
            </Text>
          </View>
          <Text style={styles.rating}>{note.rating}</Text>
        </View>

        {note.personalNotes ? (
          <Text style={styles.excerpt} numberOfLines={3}>
            {note.personalNotes}
          </Text>
        ) : null}
      </Pressable>

      <LikeButton
        noteId={note.id}
        liked={interactions?.isLikedByViewer ?? false}
        count={interactions?.likeCount ?? 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  author: { alignItems: "center", flexDirection: "row", gap: 10, minHeight: 44 },
  authorName: { color: theme.text, flex: 1, fontSize: 14, fontWeight: "600" },
  date: { color: theme.textMuted, fontSize: 12 },
  body: { gap: 6 },
  head: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  titles: { flex: 1, gap: 2 },
  brand: { color: theme.primary, fontSize: 13, fontWeight: "600" },
  name: { color: theme.text, fontSize: 16, fontWeight: "600" },
  rating: { color: theme.primary, fontSize: 22, fontWeight: "700" },
  excerpt: { color: theme.textMuted, fontSize: 13, lineHeight: 19 },
});
