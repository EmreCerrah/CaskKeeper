import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TastingNote } from "../../data/tastingNotes";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface NoteCardProps {
  note: TastingNote;
  onPress: () => void;
}

/** A single row in the My Tastings list. */
export function NoteCard({ note, onPress }: NoteCardProps) {
  const whiskey = note.whiskey;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
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
        {note.isFavorite && <Badge label={t("notes.favorite")} />}
        {note.visibility === "public" && <Badge label={t("notes.public")} />}
      </View>
    </Pressable>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
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
});
