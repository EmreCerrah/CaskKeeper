import { Stack } from "expo-router";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

/** The profile tab carries its own stack: profile → dashboard / recommendations / wishlist. */
export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ title: t("dashboard.title") }} />
      <Stack.Screen name="recommendations" options={{ title: t("recommendations.title") }} />
      <Stack.Screen name="wishlist" options={{ title: t("wishlist.title") }} />
    </Stack>
  );
}
