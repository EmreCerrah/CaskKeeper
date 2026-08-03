/**
 * @file preference.ts
 * @description "Çevrimdışı kullanım" anahtarının durumu.
 *
 * Bu yalnızca bir arayüz tercihidir (açık/kapalı), kişisel veri değil — bu
 * yüzden localStorage yeterli ve senkron okunabilmesi anahtarın ilk render'da
 * doğru konumda çizilmesini sağlıyor. Kullanıcı verisinin kendisi Cache API'de
 * durur (bkz. store.ts).
 *
 * Varsayılan KAPALI: hiç kimsenin verisi istemeden cihaza yazılmaz.
 */

const STORAGE_KEY = "caskkeeper:offline-enabled";
const PREFERENCE_EVENT = "caskkeeper:offline-preference";

export function isOfflineEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Gizli sekmede localStorage erişimi hata verebilir.
    return false;
  }
}

export function setOfflineEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Yazılamıyorsa tercih kalıcı olmaz; yine de bu oturumda dinleyiciler
    // güncellensin diye olay gönderilir.
  }
  window.dispatchEvent(new CustomEvent(PREFERENCE_EVENT, { detail: enabled }));
}

/** Anahtar başka bir bileşenden değiştirildiğinde haberdar olmak için. */
export function subscribeOfflinePreference(callback: (enabled: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onPreference = (event: Event) => callback((event as CustomEvent<boolean>).detail);
  // Başka bir sekmede değiştirilirse storage olayı gelir.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback(isOfflineEnabled());
  };

  window.addEventListener(PREFERENCE_EVENT, onPreference);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PREFERENCE_EVENT, onPreference);
    window.removeEventListener("storage", onStorage);
  };
}
