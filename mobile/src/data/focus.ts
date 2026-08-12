import { focusManager } from "@tanstack/react-query";
import { AppState, type AppStateStatus } from "react-native";

/**
 * @file focus.ts
 * @description TanStack Query'ye uygulamanın ön planda olup olmadığını bildirir.
 *
 * online.ts'in ikizi: orası ağ durumunu, burası odağı taşıyor. Kütüphane
 * tarayıcının `window.focus` olayını dinliyor, React Native'de öyle bir şey yok
 * ve bağlanmadığı sürece `refetchOnWindowFocus` hiçbir şey yapmaz — sessizce.
 *
 * Genel varsayılan yine `false` (bkz. queryClient.ts: her dönüşte ağa çıkmak
 * pili yorar). Bu bağlantı yalnızca açıkça isteyen sorgular için: bildirim
 * rozetinin uygulamayı geri açtığında güncel olması gerekiyor.
 */
export function startFocusManager(): () => void {
  const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
    // "inactive" ne ön plan ne arka plan — iOS'ta bildirim merkezi açılırken ya
    // da uygulama değiştirici gösterilirken geçilen ara durum. Odağı kaybetmiş
    // saymak, kullanıcı geri döndüğünde gereksiz bir tazeleme turu başlatırdı.
    focusManager.setFocused(status === "active");
  });

  return () => subscription.remove();
}
