import type { Metadata } from "next";
import { OfflineView } from "@/components/offline/OfflineView";

export const metadata: Metadata = { title: "Çevrimdışı" };

/**
 * Çevrimdışı görünüm.
 *
 * (main) route grubunun DIŞINDA duruyor: oradaki layout Navbar'ı render eder ve
 * Navbar oturumu okur, bu da sayfayı KULLANICIYA ÖZEL yapardı. Buradaki tek
 * sunucu girdisi dil çerezi; kişisel hiçbir veri okunmaz, dolayısıyla HTML'i
 * önbelleğe almak güvenlidir. Veriler istemcide, cihazdaki kopyadan okunur.
 *
 * Sayfa `force-static` DEĞİL: kök layout dil çerezini okuduğu için tüm rotalar
 * dinamik. Bu bir sorun değil — service worker sayfayı senkron sırasında
 * (cacheOfflineShell) önbelleğe alıyor, statik üretime bağlı değil. Tek etkisi,
 * önbellekteki kopyanın alındığı andaki dilde donması; sonraki senkronda
 * tazeleniyor.
 */

export default function OfflinePage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <OfflineView />
    </main>
  );
}
