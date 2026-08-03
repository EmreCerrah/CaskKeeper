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

const CACHE_VERSION = "caskkeeper-v1";

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

  // Gezinme istekleri, /api/* ve diğer her şey doğrudan ağa gider —
  // tarayıcının kendi davranışına dokunulmaz.
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
