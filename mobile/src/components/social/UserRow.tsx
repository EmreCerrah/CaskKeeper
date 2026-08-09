import { Pressable, StyleSheet, Text, View } from "react-native";
import type { UserSearchResult } from "../../data/users";
import { FollowButton } from "./FollowButton";
import { WhiskeyImage } from "../WhiskeyImage";
import { t } from "../../i18n";
import { theme } from "../../theme";

interface UserRowProps {
  user: UserSearchResult;
  onPress: () => void;
}

/** Kişi arama sonuçlarındaki satır. */
export function UserRow({ user, onPress }: UserRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {/* Avatar için aynı yedek gösterim: profil fotoğrafı da dış bir URL. */}
      <WhiskeyImage uri={user.profilePicture} fallbackText={user.name} size={44} />

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {t("people.noteCount", { count: user.publicNoteCount })}
        </Text>
        {/* İlişki metinle anlatılıyor, rozet rengiyle değil. */}
        {user.isMutual ? (
          <Text style={styles.badge}>{t("people.friend")}</Text>
        ) : user.isFollowingViewer ? (
          <Text style={styles.badge}>{t("people.followsYou")}</Text>
        ) : null}
      </View>

      <FollowButton userId={user.id} following={user.isFollowedByViewer} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  pressed: { opacity: 0.75 },
  body: { flex: 1, gap: 2 },
  name: { color: theme.text, fontSize: 16, fontWeight: "600" },
  meta: { color: theme.textMuted, fontSize: 12 },
  badge: { color: theme.primary, fontSize: 11, fontWeight: "600" },
});
