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
 * Add to / remove from the wishlist.
 *
 * The state is read from the cache and updated optimistically, so no local
 * state is kept here — two sources would drift apart (the reasoning from
 * LikeButton).
 *
 * State is not conveyed by colour alone: the filled/outline bookmark icon, the
 * label and `accessibilityState` all change together.
 */
export function WishlistButton({ whiskey }: WishlistButtonProps) {
  const { data, isLoading } = useIsWishlisted(whiskey.id);
  const toggle = useToggleWishlist();

  const wishlisted = data?.wishlisted ?? false;

  // The button is not drawn until the state is known: showing "Add" and
  // flipping to "On your list" a second later would pull the thing the user
  // was reaching for out from under them.
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
    // Touch target at least 44px (WCAG 2.5.5).
    minHeight: 48,
    paddingHorizontal: 20,
  },
  // Primary button when it is not on the list, outlined when it is — the same
  // variant switch as the web.
  inactive: { backgroundColor: theme.primary, borderColor: theme.primary },
  active: { backgroundColor: "transparent", borderColor: theme.primary },
  loading: { backgroundColor: "transparent", borderColor: theme.border },
  pressed: { opacity: 0.85 },
  label: { fontSize: 16, fontWeight: "600" },
  labelInactive: { color: theme.onPrimary },
  labelActive: { color: theme.primary },
});
