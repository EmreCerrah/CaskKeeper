import { Stack } from "expo-router";
import { theme } from "../../../src/theme";

/** The My Tastings stack: list → new note / edit note. */
export default function MyTastingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ title: "" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
    </Stack>
  );
}
