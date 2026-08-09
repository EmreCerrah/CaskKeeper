import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useToggleFollow } from "../../data/users";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface FollowButtonProps {
  userId: string;
  following: boolean;
}

/**
 * Takip düğmesi.
 *
 * İyimser güncelleme YOK: takip değişince akışın tamamı değişiyor (o kişinin
 * bütün notları giriyor ya da çıkıyor) ve bunu istemcide taklit etmek
 * sunucunun sıralamasını tahmin etmek olurdu. İstek dönene kadar dönen
 * gösterge var.
 */
export function FollowButton({ userId, following }: FollowButtonProps) {
  const toggleFollow = useToggleFollow(userId);

  return (
    <Pressable
      onPress={() => toggleFollow.mutate(following)}
      disabled={toggleFollow.isPending}
      accessibilityRole="button"
      accessibilityState={{ selected: following, busy: toggleFollow.isPending }}
      style={({ pressed }) => [
        styles.button,
        following && styles.buttonFollowing,
        pressed && styles.pressed,
      ]}
    >
      {toggleFollow.isPending ? (
        <ActivityIndicator color={following ? theme.text : theme.onPrimary} size="small" />
      ) : (
        <Text style={[styles.label, following && styles.labelFollowing]}>
          {following ? t("people.unfollow") : t("people.follow")}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: theme.primary,
    borderColor: theme.primary,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 110,
    paddingHorizontal: 16,
  },
  // Takip ediliyorken düğme ters çevriliyor: durum yalnızca metinle değil
  // biçimle de belli oluyor.
  buttonFollowing: { backgroundColor: "transparent", borderColor: theme.border },
  pressed: { opacity: 0.8 },
  label: { color: theme.onPrimary, fontSize: 14, fontWeight: "700" },
  labelFollowing: { color: theme.text, fontWeight: "600" },
});
