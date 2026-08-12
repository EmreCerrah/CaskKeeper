import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/auth/AuthContext";
import { createQueryClient } from "../src/data/queryClient";
import { startOnlineManager } from "../src/data/online";
import { startFocusManager } from "../src/data/focus";
import { persistOptions } from "../src/data/persist";
import { OfflineBanner } from "../src/components/OfflineBanner";
import { theme } from "../src/theme";

/**
 * The root of the app: the session and data providers live here.
 *
 * PersistQueryClientProvider rather than QueryClientProvider — the cache is
 * written to disk, so the catalogue and your own notes can be read when the
 * app opens with no connection. What gets written is decided, and tested, in
 * persist-rules.ts. No screen knows any of this happened.
 *
 * The QueryClient is built once through useState — created at module level it
 * would reset the cache on every hot reload during development.
 */
export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);

  // Reports the device's network state to TanStack: refetching happens by
  // itself on reconnect, and offline requests are not retried pointlessly.
  useEffect(startOnlineManager, []);

  // When the app returns to the foreground, queries that opt in are refetched
  // — today that is only the notification badge.
  useEffect(startFocusManager, []);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <OfflineBanner />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.background },
            }}
          />
        </AuthProvider>
      </SafeAreaProvider>
    </PersistQueryClientProvider>
  );
}
