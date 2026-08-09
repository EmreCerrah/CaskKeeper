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
 * Beğeni düğmesi.
 *
 * Sayı ve durum önbellekten geliyor ve iyimser güncelleniyor, bu yüzden burada
 * yerel durum tutulmuyor — iki kaynak olsaydı ayrışırlardı.
 *
 * Durum yalnızca renkle anlatılmıyor: dolu/boş kalp ve erişilebilirlik etiketi
 * de değişiyor.
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
    // Dokunma hedefi (WCAG 2.5.5).
    minHeight: 44,
    paddingRight: 12,
  },
  pressed: { opacity: 0.7 },
  heart: { color: theme.textMuted, fontSize: 20 },
  heartActive: { color: theme.primary },
  count: { color: theme.textMuted, fontSize: 13 },
});
