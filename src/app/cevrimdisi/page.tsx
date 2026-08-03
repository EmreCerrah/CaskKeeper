import type { Metadata } from "next";
import { OfflineView } from "@/components/offline/OfflineView";

export const metadata: Metadata = { title: "Çevrimdışı" };

/**
 * Çevrimdışı görünüm.
 *
 * (main) route grubunun DIŞINDA duruyor: oradaki layout Navbar'ı render eder ve
 * Navbar oturumu sunucuda okur, bu da sayfayı dinamik ve kullanıcıya özel
 * yapardı. Burada sunucu tarafında hiçbir kişisel veri okunmadığı için sayfa
 * statik üretilir — service worker onu önbelleğe alıp bağlantı yokken
 * sunabiliyor. Veriler istemcide, cihazdaki kopyadan okunur.
 */
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <OfflineView />
    </main>
  );
}
