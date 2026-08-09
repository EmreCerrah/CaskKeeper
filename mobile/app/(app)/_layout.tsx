import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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

export default function AppLayout() {
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
        name="katalog"
        options={{ title: t("tab.catalogue"), tabBarIcon: tabIcon("wine", "wine-outline") }}
      />
      <Tabs.Screen
        name="akis"
        options={{ title: t("tab.feed"), tabBarIcon: tabIcon("people", "people-outline") }}
      />
      <Tabs.Screen
        name="tadimlarim"
        options={{ title: t("tab.myTastings"), tabBarIcon: tabIcon("bookmark", "bookmark-outline") }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: t("tab.profile"), tabBarIcon: tabIcon("person", "person-outline") }}
      />
    </Tabs>
  );
}
