import { clearOfflineSnapshot } from "@/lib/offline/store";
import { setOfflineEnabled } from "@/lib/offline/preference";
import { resetSyncThrottle } from "@/lib/offline/sync";

/**
 * İstemci tarafı çıkış akışı.
 *
 * Oturum çerezini düşürmenin yanında cihaza indirilmiş çevrimdışı kopyayı da
 * siler — aksi halde ortak kullanılan bir cihazda çıkış yapıldıktan sonra bile
 * önceki kullanıcının tadım notları /cevrimdisi sayfasından okunabilirdi.
 *
 * Çıkış iki ayrı yerden tetikleniyordu (UserMenu ve MobileTabBar); temizliğin
 * birinde unutulmaması için akış burada toplandı.
 */
export async function logoutClient(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  await clearOfflineSnapshot();
  // Anahtar da kapatılır: aksi halde aynı cihazda giriş yapan bir sonraki
  // kullanıcı, hiç istemediği hâlde açık bir çevrimdışı kayıt devralırdı.
  setOfflineEnabled(false);
  resetSyncThrottle();
}
