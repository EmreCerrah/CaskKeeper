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
      <Stack.Screen name="people" options={{ title: "" }} />
      <Stack.Screen name="notifications" options={{ title: t("notifications.title") }} />
      <Stack.Screen name="user/[id]" options={{ title: "" }} />
      <Stack.Screen name="note/[id]" options={{ title: "" }} />
    </Stack>
  );
}
