import { Stack } from "expo-router";
import { theme } from "../../../src/theme";

/** Tadımlarım sekmesinin yığını: liste → yeni not / not düzenleme. */
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
      <Stack.Screen name="yeni" options={{ title: "" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
    </Stack>
  );
}
