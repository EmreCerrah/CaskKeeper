import { Stack } from "expo-router";
import { t } from "../../../src/i18n";
import { theme } from "../../../src/theme";

/** Profil sekmesi kendi yığınını taşır: profil → panelim / öneriler. */
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
      <Stack.Screen name="panelim" options={{ title: t("dashboard.title") }} />
      <Stack.Screen name="oneriler" options={{ title: t("recommendations.title") }} />
    </Stack>
  );
}
