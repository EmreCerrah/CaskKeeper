import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/auth/AuthContext";
import { createQueryClient } from "../src/data/queryClient";
import { theme } from "../src/theme";

/**
 * Uygulamanın kökü: oturum ve veri sağlayıcıları burada, altındaki her ekran
 * ikisini de görür.
 *
 * QueryClient useState ile bir kez kuruluyor — modül seviyesinde oluşturulsaydı
 * geliştirme sırasında her sıcak yenilemede önbellek sıfırlanırdı.
 *
 * Çevrimdışı kalıcılık ileride BURAYA takılacak (QueryClientProvider yerine
 * PersistQueryClientProvider); ekranların hiçbiri değişmeyecek.
 */
export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.background },
            }}
          />
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
