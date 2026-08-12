/**
 * CaskKeeper service worker.
 *
 * Kapsam bilinçli olarak dar: uygulamanın kurulabilir olması ve tekrar
 * açılışlarda statik varlıkların ağa gitmeden gelmesi. Çevrimdışı çalışan bir
 * uygulama hedeflenmiyor — tüm veri sunucuda olduğu için bağlantı yokken
 * gösterilecek anlamlı bir içerik zaten yok. Bağlantı hatasını tarayıcının
 * kendi arayüzü bildirir.
 *
 * GÜVENLİK — neden HTML ve API yanıtları önbelleğe ALINMAZ:
 * Kök layout'taki Navbar bir server component olarak oturumu okur, dolayısıyla
 * her sayfanın HTML'i kullanıcıya özeldir. /api/* yanıtları da kişisel veri
 * taşır. Bunlar önbelleğe alınsaydı ortak kullanılan bir cihazda çıkış
 * yapıldıktan sonra bile önceki kullanıcının verisi sunulabilirdi. Bu yüzden
 * yalnızca içeriği kullanıcıdan bağımsız olan varlıklar önbelleğe alınır.
 *
 * Önbellek sürümü: strateji veya kapsam değiştiğinde artırın; activate
 * sırasında eski sürümler silinir.
 */

// src/lib/offline/store.ts içindeki SHELL_CACHE ile aynı olmalı; service worker
// düz JS olduğu için oradan import edemiyor.
const CACHE_VERSION = "caskkeeper-v1";

/**
 * Bağlantı yokken gezinme isteklerine sunulan sayfa. (main) route grubunun
 * dışında olduğu için statiktir ve içinde kullanıcı verisi yoktur — bu yüzden
 * "sayfa HTML'i önbelleğe alınmaz" kuralının tek istisnası olabiliyor.
 * Kullanıcı panelden veri indirdiğinde önbelleğe alınır (cacheOfflineShell).
 */
const OFFLINE_PAGE = "/offline";

self.addEventListener("install", (event) => {
  // Ön yükleme yok: önbellek kullanıldıkça dolar.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

/**
 * İçeriği kullanıcıdan bağımsız olan, uzun süre önbelleklenebilir yollar.
 * Next.js derleme çıktıları dosya adında hash taşır; içerik değişirse ad da
 * değişir, bu yüzden bayatlama riski yoktur.
 */
function isImmutableAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Yalnızca GET önbelleklenebilir; POST/PATCH/DELETE her zaman ağa gider.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Başka origin'lere (ör. katalog görselleri) karışma.
  if (url.origin !== self.location.origin) return;

  // Gezinme istekleri her zaman ağa gider — yanıt kullanıcıya özel olduğu için
  // saklanmaz. Ağ erişilemezse, kullanıcı daha önce verisini indirdiyse
  // çevrimdışı sayfası sunulur; indirmediyse tarayıcının kendi hatası görünür.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(OFFLINE_PAGE, { cacheName: CACHE_VERSION });
        return cached ?? Response.error();
      })
    );
    return;
  }

  // /api/* ve diğer her şey doğrudan ağa gider.
  if (!isImmutableAsset(url)) return;

  event.respondWith(
    caches.match(request, { cacheName: CACHE_VERSION }).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Yalnızca başarılı, aynı origin'li yanıtlar saklanır.
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
