import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsWishlisted, useToggleWishlist } from "../../data/wishlist";
import type { Whiskey } from "../../data/whiskeys";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface WishlistButtonProps {
  whiskey: Whiskey;
}

/**
 * İstek listesine ekle / kaldır.
 *
 * Durum önbellekten okunuyor ve iyimser güncelleniyor, bu yüzden burada yerel
 * durum tutulmuyor — iki kaynak olsaydı ayrışırlardı (LikeButton'daki gerekçe).
 *
 * Durum yalnızca renkle anlatılmıyor: dolu/boş yer imi ikonu, metin ve
 * `accessibilityState` birlikte değişiyor.
 */
export function WishlistButton({ whiskey }: WishlistButtonProps) {
  const { data, isLoading } = useIsWishlisted(whiskey.id);
  const toggle = useToggleWishlist();

  const wishlisted = data?.wishlisted ?? false;

  // Durum daha bilinmiyorken düğme çizilmiyor: "Ekle" gösterip bir saniye
  // sonra "Listemde"ye dönmek, kullanıcının dokunduğu şeyi altından çekerdi.
  if (isLoading) {
    return (
      <Pressable style={[styles.button, styles.loading]} disabled accessibilityRole="button">
        <ActivityIndicator color={theme.primary} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => toggle.mutate({ whiskey, wishlisted })}
      accessibilityRole="button"
      accessibilityLabel={wishlisted ? t("whiskey.wishlistRemove") : t("whiskey.wishlistAdd")}
      accessibilityState={{ selected: wishlisted }}
      style={({ pressed }) => [
        styles.button,
        wishlisted ? styles.active : styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={wishlisted ? "bookmark" : "bookmark-outline"}
        size={18}
        color={wishlisted ? theme.primary : theme.onPrimary}
      />
      <Text style={[styles.label, wishlisted ? styles.labelActive : styles.labelInactive]}>
        {wishlisted ? t("whiskey.wishlistAdded") : t("whiskey.wishlistAdd")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    // Dokunma hedefi en az 44px (WCAG 2.5.5).
    minHeight: 48,
    paddingHorizontal: 20,
  },
  // Listede değilken birincil düğme; listedeyken çerçeveli — web'deki
  // varyant değişiminin aynısı.
  inactive: { backgroundColor: theme.primary, borderColor: theme.primary },
  active: { backgroundColor: "transparent", borderColor: theme.primary },
  loading: { backgroundColor: "transparent", borderColor: theme.border },
  pressed: { opacity: 0.85 },
  label: { fontSize: 16, fontWeight: "600" },
  labelInactive: { color: theme.onPrimary },
  labelActive: { color: theme.primary },
});
