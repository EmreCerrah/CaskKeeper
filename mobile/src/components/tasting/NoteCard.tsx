import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TastingNote } from "../../data/tastingNotes";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface NoteCardProps {
  note: TastingNote;
  onPress: () => void;
}

/**
 * A single row in the My Tastings list.
 *
 * A note written with no connection sits here before the server has it. It is
 * shown as itself — same score, same date, same words — with a badge saying so,
 * because the alternative is a list that quietly omits what the user just
 * wrote. The badge carries text, not just a colour.
 */
export function NoteCard({ note, onPress }: NoteCardProps) {
  const whiskey = note.whiskey;
  const pending = note.localStatus === "pending";
  const failed = note.localStatus === "failed";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        pending && styles.waiting,
        failed && styles.failed,
        pressed && styles.pressed,
      ]}
    >
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

      <Text style={styles.date}>{new Date(note.tastingDate).toLocaleDateString()}</Text>

      {/* States are carried in text as well as colour. */}
      <View style={styles.badges}>
        {pending && <Badge label={t("notes.pending")} tone="waiting" />}
        {failed && <Badge label={t("notes.failed")} tone="failed" />}
        {note.isFavorite && <Badge label={t("notes.favorite")} />}
        {note.visibility === "public" && <Badge label={t("notes.public")} />}
      </View>

      {/* The reason is on the card, not only behind a tap: a note that will
          never be sent should say so where it is seen. */}
      {failed && note.localError ? <Text style={styles.reason}>{note.localError}</Text> : null}
    </Pressable>
  );
}

function Badge({ label, tone }: { label: string; tone?: "waiting" | "failed" }) {
  return (
    <View style={[styles.badge, tone === "waiting" && styles.badgeWaiting, tone === "failed" && styles.badgeFailed]}>
      <Text
        style={[
          styles.badgeText,
          tone === "waiting" && styles.badgeTextWaiting,
          tone === "failed" && styles.badgeTextFailed,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  pressed: { opacity: 0.75 },
  // A dashed edge for "not settled yet", a solid warning edge once it never
  // will be. Both are backed by a badge with words in it — the border alone
  // would be meaningless to anyone who cannot separate the two colours.
  waiting: { borderStyle: "dashed", borderColor: theme.primary },
  failed: { borderColor: theme.danger },
  head: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  titles: { flex: 1, gap: 2 },
  brand: { color: theme.primary, fontSize: 13, fontWeight: "600" },
  name: { color: theme.text, fontSize: 16, fontWeight: "600" },
  rating: { color: theme.primary, fontSize: 22, fontWeight: "700" },
  date: { color: theme.textMuted, fontSize: 12 },
  badges: { flexDirection: "row", gap: 6 },
  badge: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: theme.textMuted, fontSize: 11 },
  badgeWaiting: { borderColor: theme.primary },
  badgeTextWaiting: { color: theme.primary },
  badgeFailed: { borderColor: theme.danger },
  badgeTextFailed: { color: theme.danger },
  reason: { color: theme.danger, fontSize: 12 },
});
