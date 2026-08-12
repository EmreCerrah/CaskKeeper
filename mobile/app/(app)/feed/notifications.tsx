import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../../src/components/Button";
import { NotificationRow } from "../../../src/components/social/NotificationRow";
import { useMarkAllRead, useMarkRead, useNotifications } from "../../../src/data/notifications";
import { notificationRoute } from "../../../src/data/notification-text";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

/**
 * Notifications.
 *
 * Inside the feed stack: almost every notification comes from the people in
 * the feed, and the tab bar stays at four.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error instanceof Error ? error.message : t("error.unexpected")}</Text>
        <View style={styles.retry}>
          <Button label={t("catalogue.retry")} onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.flex}
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      onRefresh={refetch}
      refreshing={isRefetching}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.summary}>
            {unreadCount > 0 ? t("notifications.unreadCount", { count: unreadCount }) : t("notifications.allRead")}
          </Text>
          {/* With nothing to read the button is hidden — a button that does
              nothing when pressed is indistinguishable from a broken one. */}
          {unreadCount > 0 && (
            <Pressable
              onPress={() => markAllRead.mutate()}
              accessibilityRole="button"
              style={styles.markAll}
            >
              <Text style={styles.markAllText}>{t("notifications.markAllRead")}</Text>
            </Pressable>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <NotificationRow
          notification={item}
          onPress={() => {
            // Marking as read does not hold up the navigation: it is applied
            // optimistically and the user moves on to the target.
            if (!item.isRead) markRead.mutate(item.id);
            router.push(notificationRoute(item));
          }}
        />
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>{t("notifications.empty")}</Text>
          <Text style={styles.emptyHint}>{t("notifications.emptyHint")}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.background },
  list: { gap: 10, padding: 16, paddingBottom: 48 },
  center: { alignItems: "center", backgroundColor: theme.background, flex: 1, gap: 8, justifyContent: "center", padding: 32 },
  header: { gap: 6, marginBottom: 4 },
  summary: { color: theme.textMuted, fontSize: 14 },
  markAll: { justifyContent: "center", minHeight: 44 },
  markAllText: { color: theme.primary, fontSize: 14, fontWeight: "600" },
  empty: { color: theme.text, fontSize: 16, textAlign: "center" },
  emptyHint: { color: theme.textMuted, fontSize: 13, lineHeight: 19, textAlign: "center" },
  error: { color: theme.danger, fontSize: 14, textAlign: "center" },
  retry: { marginTop: 8, minWidth: 160 },
});
