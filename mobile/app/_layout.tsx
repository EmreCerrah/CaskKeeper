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
 * Uygulamanın kökü: oturum ve veri sağlayıcıları burada.
 *
 * QueryClientProvider yerine PersistQueryClientProvider — önbellek diske
 * yazılıyor, böylece uygulama bağlantısız açıldığında katalog ve kendi
 * notların okunabiliyor. Neyin yazıldığı persist-rules.ts'te ve testli.
 * Ekranların hiçbiri bu değişiklikten haberdar değil.
 *
 * QueryClient useState ile bir kez kuruluyor — modül seviyesinde oluşturulsaydı
 * geliştirme sırasında her sıcak yenilemede önbellek sıfırlanırdı.
 */
export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);

  // Cihazın ağ durumunu TanStack'e bildirir: bağlantı gelince tazeleme
  // kendiliğinden oluyor, çevrimdışıyken boşuna istek denenmiyor.
  useEffect(startOnlineManager, []);

  // Uygulama ön plana dönünce bunu isteyen sorgular tazeleniyor — bugün
  // yalnızca bildirim rozeti.
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
