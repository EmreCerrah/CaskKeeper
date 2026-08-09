import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";

/**
 * @file online.ts
 * @description TanStack Query'ye cihazın ağ durumunu bildirir.
 *
 * Varsayılan olarak React Native'de kütüphane hep "çevrimiçi" varsayıyor.
 * Bağlanınca kendiliğinden tazeleme ve çevrimdışıyken boşuna denememe
 * davranışı bu bağlantıya dayanıyor.
 *
 * expo-network kullanılıyor, ayrı bir topluluk paketi değil — Expo'nun kendi
 * modülü ve zaten aynı bilgiyi veriyor.
 */
export function startOnlineManager(): () => void {
  // Açılışta bir kez sor: dinleyici yalnızca DEĞİŞİMDE tetikleniyor, yani
  // uygulama uçak modunda açılırsa ilk durum hiç bildirilmezdi.
  Network.getNetworkStateAsync()
    .then((state) => onlineManager.setOnline(Boolean(state.isInternetReachable ?? state.isConnected)))
    .catch(() => {
      // Durum okunamadıysa çevrimiçi varsay: istek denenir ve gerçek hata
      // kullanıcıya normal yoldan gösterilir.
      onlineManager.setOnline(true);
    });

  const subscription = Network.addNetworkStateListener((state) => {
    onlineManager.setOnline(Boolean(state.isInternetReachable ?? state.isConnected));
  });

  return () => subscription.remove();
}
