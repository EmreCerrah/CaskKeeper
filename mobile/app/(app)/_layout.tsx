import { Tabs } from "expo-router";
import { t } from "../../src/i18n";
import { theme } from "../../src/theme";

/**
 * Alt sekme çubuğu.
 *
 * Şimdilik iki sekme, ama yapı şimdi kuruluyor: sonraki dilimler (Tadımlarım,
 * Akış, Panel) sekme eklemekten ibaret kalsın. Sonradan kurmak bütün
 * yönlendirmeyi yeniden düzenlemek olurdu.
 *
 * Yönetim sekmesi BİLEREK yok — katalog yönetimi masabaşı işi, mobil kapsam dışı.
 */
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
      {/* Dört sekme: beşinci eklendiğinde küçük telefonlarda etiketler
          kırpılıyor. Kişi arama bu yüzden ayrı sekme değil, Akış yığınının
          içinde bir ekran. */}
      <Tabs.Screen name="katalog" options={{ title: t("tab.catalogue") }} />
      <Tabs.Screen name="akis" options={{ title: t("tab.feed") }} />
      <Tabs.Screen name="tadimlarim" options={{ title: t("tab.myTastings") }} />
      <Tabs.Screen name="profil" options={{ title: t("tab.profile") }} />
    </Tabs>
  );
}
