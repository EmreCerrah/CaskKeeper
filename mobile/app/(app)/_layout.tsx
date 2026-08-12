import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUnreadCount } from "../../src/data/notifications";
import { t } from "../../src/i18n";
import { theme } from "../../src/theme";

/**
 * Alt sekme çubuğu.
 *
 * Dört sekme: beşinci eklendiğinde küçük telefonlarda etiketler kırpılıyor.
 * Kişi arama bu yüzden ayrı sekme değil, Akış yığınının içinde bir ekran.
 * Yönetim sekmesi de bilerek yok — katalog yönetimi masabaşı işi.
 *
 * İkonlar `@expo/vector-icons` ile geliyor; Expo ile birlikte kurulu olduğu
 * için yeni bir bağımlılık değil. İkonsuz bırakıldığında React Navigation
 * etiketin üstünde boş bir alan bırakıyor ve çubuk bozuk görünüyor.
 */

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

/** Seçili sekme dolu, diğerleri çizgi — durum yalnızca renkle anlatılmıyor. */
function tabIcon(active: IoniconName, inactive: IoniconName) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={size} color={color} />
  );
}

/** Rozet metni: sıfırda hiç gösterilmiyor, üç haneli sayı rozete sığmıyor. */
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
          // Rozet Akış sekmesinde, çünkü bildirim ekranı o yığının içinde ve
          // bildirimlerin tamamı akıştaki insanlardan geliyor. Sıfırken
          // `undefined`: "0" yazan bir rozet gösterilmemeli.
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
