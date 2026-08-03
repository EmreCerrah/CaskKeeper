import { clearOfflineSnapshot } from "@/lib/offline/store";

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
}
