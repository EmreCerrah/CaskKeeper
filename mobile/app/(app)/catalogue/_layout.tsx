import { Stack } from "expo-router";
import { theme } from "../../../src/theme";

/** Katalog sekmesi kendi yığınını taşır: liste → detay. */
export default function CatalogueLayout() {
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
      <Stack.Screen name="[slug]" options={{ title: "" }} />
    </Stack>
  );
}
