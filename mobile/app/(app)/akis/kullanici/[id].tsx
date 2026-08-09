import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FollowButton } from "../../../../src/components/social/FollowButton";
import { NoteCard } from "../../../../src/components/tasting/NoteCard";
import { WhiskeyImage } from "../../../../src/components/WhiskeyImage";
import { usePublicProfile, useUserNotes } from "../../../../src/data/users";
import { t } from "../../../../src/i18n";
import { theme } from "../../../../src/theme";

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = id ?? "";

  const { data: profile, isLoading, isError, error } = usePublicProfile(userId);
  const { data: notes } = useUserNotes(userId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error instanceof Error ? error.message : t("error.unexpected")}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.flex}
      data={notes?.data ?? []}
      keyExtractor={(note) => note.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <WhiskeyImage uri={profile.profilePicture} fallbackText={profile.name} size={80} />
          <Text style={styles.name}>{profile.name}</Text>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          <View style={styles.stats}>
            <Stat value={profile.followerCount} label={t("profile.followers")} />
            <Stat value={profile.followingCount} label={t("profile.following")} />
            <Stat value={profile.publicNoteCount} label={t("profile.publicNotes")} />
          </View>

          {/* Kendi profilinde takip düğmesi gösterilmez — sunucu söylüyor. */}
          {!profile.isOwnProfile && (
            <FollowButton userId={profile.id} following={profile.isFollowedByViewer} />
          )}

          {profile.isMutual && <Text style={styles.badge}>{t("people.friend")}</Text>}
        </View>
      }
      renderItem={({ item }) => (
        <NoteCard note={item} onPress={() => router.push(`/(app)/akis/not/${item.id}`)} />
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>{t("profile.noPublicNotes")}</Text>
        </View>
      }
    />
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { backgroundColor: theme.background },
  list: { gap: 10, padding: 16 },
  center: { alignItems: "center", backgroundColor: theme.background, flex: 1, justifyContent: "center", padding: 32 },
  header: { alignItems: "center", gap: 8, paddingBottom: 12 },
  name: { color: theme.text, fontSize: 22, fontWeight: "700" },
  bio: { color: theme.textMuted, fontSize: 14, textAlign: "center" },
  stats: { flexDirection: "row", gap: 24, marginVertical: 8 },
  stat: { alignItems: "center" },
  statValue: { color: theme.text, fontSize: 18, fontWeight: "700" },
  statLabel: { color: theme.textMuted, fontSize: 12 },
  badge: { color: theme.primary, fontSize: 12, fontWeight: "600" },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  empty: { color: theme.textMuted, fontSize: 14 },
});
