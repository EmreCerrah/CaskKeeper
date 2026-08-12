import { Stack } from "expo-router";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

/** Akış yığını: akış → kişiler / profil / not detayı. */
export default function FeedLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="kisiler" options={{ title: "" }} />
      <Stack.Screen name="bildirimler" options={{ title: t("notifications.title") }} />
      <Stack.Screen name="kullanici/[id]" options={{ title: "" }} />
      <Stack.Screen name="not/[id]" options={{ title: "" }} />
    </Stack>
  );
}
