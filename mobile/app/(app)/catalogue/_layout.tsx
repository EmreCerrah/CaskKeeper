import { Stack } from "expo-router";
import { theme } from "../../../src/theme";

/** The catalogue tab carries its own stack: list → detail. */
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
