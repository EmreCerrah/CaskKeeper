import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUnreadCount } from "../../src/data/notifications";
import { t } from "../../src/i18n";
import { theme } from "../../src/theme";

/**
 * The bottom tab bar.
 *
 * Four tabs: a fifth clips the labels on small phones. People search is
 * therefore not its own tab but a screen inside the Feed stack. There is
 * deliberately no admin tab either — managing the catalogue is desk work.
 *
 * The icons come from `@expo/vector-icons`, which ships with Expo, so it is
 * not a new dependency. Left without icons, React Navigation leaves an empty
 * space above the label and the bar looks broken.
 */

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/** The active tab is filled, the rest outlined — state is not carried by colour alone. */
function tabIcon(active: IoniconName, inactive: IoniconName) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={size} color={color} />
  );
}

/** Badge text: nothing at zero, and a three-digit number does not fit. */
function badgeText(count: number): string | undefined {
  if (count <= 0) return undefined;
  return count > 99 ? "99+" : String(count);
}

export default function AppLayout() {
  const unreadCount = useUnreadCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen
        name="catalogue"
        options={{ title: t("tab.catalogue"), tabBarIcon: tabIcon("wine", "wine-outline") }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: t("tab.feed"),
          tabBarIcon: tabIcon("people", "people-outline"),
          // The badge sits on the Feed tab because the notification screen is
          // inside that stack and the notifications all come from the people
          // in the feed. `undefined` at zero: a badge reading "0" should never
          // be shown.
          tabBarBadge: badgeText(unreadCount),
          tabBarBadgeStyle: { backgroundColor: theme.primary, color: theme.onPrimary },
        }}
      />
      <Tabs.Screen
        name="my-tastings"
        options={{ title: t("tab.myTastings"), tabBarIcon: tabIcon("bookmark", "bookmark-outline") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t("tab.profile"), tabBarIcon: tabIcon("person", "person-outline") }}
      />
    </Tabs>
  );
}
