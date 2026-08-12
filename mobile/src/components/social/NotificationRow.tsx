import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WhiskeyImage } from "../WhiskeyImage";
import { notificationMessage, type AppNotification, type NotificationType } from "../../data/notification-text";
import { t } from "../../i18n";
import { theme } from "../../theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<NotificationType, IoniconName> = {
  follow: "person-add",
  like: "heart",
  comment: "chatbubble",
};

interface NotificationRowProps {
  notification: AppNotification;
  onPress: () => void;
}

/**
 * Tek bildirim satırı.
 *
 * Okunmamış olmak yalnızca renkle anlatılmıyor: çerçeve vurgulu, sağda bir
 * nokta var ve `accessibilityLabel` durumu söylüyor. Web'deki satırın aynı
 * üç işareti taşıması gibi.
 */
export function NotificationRow({ notification, onPress }: NotificationRowProps) {
  const message = notificationMessage(notification);

  // Cümle iki katmanlı: dış kalıbın {target}'ı ayrı bir anahtardan geliyor.
  const target = message.targetKey
    ? t(message.targetKey, message.whiskeyLabel ? { whiskey: message.whiskeyLabel } : undefined)
    : "";
  const sentence = t(message.key, { target });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${notification.actor.name} ${sentence}${
        notification.isRead ? "" : ` — ${t("notifications.unread")}`
      }`}
      style={({ pressed }) => [
        styles.row,
        !notification.isRead && styles.unread,
        pressed && styles.pressed,
      ]}
    >
      <WhiskeyImage uri={notification.actor.profilePicture} fallbackText={notification.actor.name} size={40} />

      <View style={styles.body}>
        <Text style={styles.text}>
          <Text style={styles.actor}>{notification.actor.name}</Text> {sentence}
        </Text>

        {notification.commentExcerpt ? (
          <Text style={styles.excerpt} numberOfLines={2}>
            “{notification.commentExcerpt}”
          </Text>
        ) : null}

        <View style={styles.meta}>
          <Ionicons name={ICONS[notification.type]} size={13} color={theme.primary} />
          <Text style={styles.date}>{new Date(notification.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {!notification.isRead && <View style={styles.dot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  unread: { borderColor: theme.primary },
  pressed: { opacity: 0.75 },
  body: { flex: 1, gap: 3 },
  text: { color: theme.textMuted, fontSize: 14, lineHeight: 20 },
  actor: { color: theme.text, fontWeight: "700" },
  excerpt: { color: theme.textMuted, fontSize: 13, fontStyle: "italic" },
  meta: { alignItems: "center", flexDirection: "row", gap: 5 },
  date: { color: theme.textMuted, fontSize: 12 },
  dot: { backgroundColor: theme.primary, borderRadius: 5, height: 10, marginTop: 4, width: 10 },
});
