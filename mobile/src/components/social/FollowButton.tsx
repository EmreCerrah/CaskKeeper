import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useToggleFollow } from "../../data/users";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface FollowButtonProps {
  userId: string;
  following: boolean;
}

/**
 * The follow button.
 *
 * NO optimistic update: following changes the entire feed (every one of that
 * person's notes enters or leaves it), and imitating that on the client would
 * mean guessing the server's ordering. A spinner runs until the request
 * returns.
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
  // While following, the button inverts: the state shows in the shape as well
  // as the label.
  buttonFollowing: { backgroundColor: "transparent", borderColor: theme.border },
  pressed: { opacity: 0.8 },
  label: { color: theme.onPrimary, fontSize: 14, fontWeight: "700" },
  labelFollowing: { color: theme.text, fontWeight: "600" },
});
