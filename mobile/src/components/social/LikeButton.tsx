import { Pressable, StyleSheet, Text } from "react-native";
import { useToggleLike } from "../../data/interactions";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface LikeButtonProps {
  noteId: string;
  liked: boolean;
  count: number;
}

/**
 * The like button.
 *
 * The count and the state come from the cache and are updated optimistically,
 * so no local state is kept here — two sources would drift apart.
 *
 * State is not conveyed by colour alone: the filled/outline heart and the
 * accessibility label change too.
 */
export function LikeButton({ noteId, liked, count }: LikeButtonProps) {
  const toggleLike = useToggleLike();

  return (
    <Pressable
      onPress={() => toggleLike.mutate({ noteId, liked })}
      accessibilityRole="button"
      accessibilityLabel={liked ? t("note.unlike") : t("note.like")}
      accessibilityState={{ selected: liked }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={[styles.heart, liked && styles.heartActive]}>{liked ? "♥" : "♡"}</Text>
      <Text style={styles.count}>{t("note.likes", { count })}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    // Touch target (WCAG 2.5.5).
    minHeight: 44,
    paddingRight: 12,
  },
  pressed: { opacity: 0.7 },
  heart: { color: theme.textMuted, fontSize: 20 },
  heartActive: { color: theme.primary },
  count: { color: theme.textMuted, fontSize: 13 },
});
