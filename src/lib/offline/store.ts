import type { TastingNoteDTO, WishlistItemDTO } from "@/lib/types/dto";

/**
 * @file store.ts
 * @description Kullanıcının kendi isteğiyle indirdiği çevrimdışı kopyanın
 * cihazda saklanması.
 *
 * Depolama için Cache API kullanılır; IndexedDB sarmalayıcısı yazılmamıştır —
 * saklanan şey iki JSON yükünden ibaret olduğu için ayrı bir soyutlama gereksiz
 * kod olurdu. Veri, varlık önbelleğinden AYRI bir kovada tutulur: çıkışta
 * yalnızca kişisel veri silinir, önbelleğe alınmış statik varlıklar kalır.
 */

/** Kişisel veri kovası — çıkışta tamamen silinir. */
const DATA_CACHE = "caskkeeper-offline-v1";

/**
 * Statik varlık kovası. public/sw.js içindeki CACHE_VERSION ile AYNI olmalıdır;
 * service worker düz JS olduğu için buradan import edemiyor. Biri değişirse
 * diğeri de değiştirilmeli.
 */
const SHELL_CACHE = "caskkeeper-v1";

/** Çevrimdışı sayfanın adresi — service worker gezinme hatasında bunu sunar. */
export const OFFLINE_PAGE = "/offline";

const KEY_NOTES = "/__offline/tasting-notes";
const KEY_WISHLIST = "/__offline/wishlist";
const KEY_META = "/__offline/meta";

export interface OfflineSnapshotMeta {
  /** Kopyanın kime ait olduğu — çevrimdışı sayfada açıkça gösterilir. */
  userId: string;
  userName: string;
  /** ISO tarih */
  syncedAt: string;
  noteCount: number;
  wishlistCount: number;
}

export interface OfflineSnapshot {
  meta: OfflineSnapshotMeta;
  notes: TastingNoteDTO[];
  wishlist: WishlistItemDTO[];
}

/** Tarayıcı Cache API'yi destekliyor mu (SSR sırasında da false döner). */
export function isOfflineStorageSupported(): boolean {
  return typeof caches !== "undefined";
}

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json" },
  });
}

async function readJson<T>(cache: Cache, key: string): Promise<T | null> {
  const hit = await cache.match(key);
  if (!hit) return null;
  try {
    return (await hit.json()) as T;
  } catch {
    return null;
  }
}

/** Kullanıcının tadım notlarını ve istek listesini cihaza yazar. */
export async function saveOfflineSnapshot(input: {
  userId: string;
  userName: string;
  notes: TastingNoteDTO[];
  wishlist: WishlistItemDTO[];
}): Promise<OfflineSnapshotMeta> {
  if (!isOfflineStorageSupported()) {
    throw new Error("Bu tarayıcı çevrimdışı kaydı desteklemiyor.");
  }

  const meta: OfflineSnapshotMeta = {
    userId: input.userId,
    userName: input.userName,
    syncedAt: new Date().toISOString(),
    noteCount: input.notes.length,
    wishlistCount: input.wishlist.length,
  };

  const cache = await caches.open(DATA_CACHE);
  await Promise.all([
    cache.put(KEY_NOTES, jsonResponse(input.notes)),
    cache.put(KEY_WISHLIST, jsonResponse(input.wishlist)),
    cache.put(KEY_META, jsonResponse(meta)),
  ]);

  return meta;
}

/** Yalnızca üst bilgi — "son senkron" göstergesi için yeterli. */
export async function getSnapshotMeta(): Promise<OfflineSnapshotMeta | null> {
  if (!isOfflineStorageSupported()) return null;
  const cache = await caches.open(DATA_CACHE);
  return readJson<OfflineSnapshotMeta>(cache, KEY_META);
}

/** Kayıtlı kopyanın tamamı. Eksik/bozuk kayıtta null döner. */
export async function readOfflineSnapshot(): Promise<OfflineSnapshot | null> {
  if (!isOfflineStorageSupported()) return null;

  const cache = await caches.open(DATA_CACHE);
  const [meta, notes, wishlist] = await Promise.all([
    readJson<OfflineSnapshotMeta>(cache, KEY_META),
    readJson<TastingNoteDTO[]>(cache, KEY_NOTES),
    readJson<WishlistItemDTO[]>(cache, KEY_WISHLIST),
  ]);

  if (!meta || !notes || !wishlist) return null;
  return { meta, notes, wishlist };
}

/** Kişisel veriyi siler. Çıkışta ve "sil" butonunda çağrılır. */
export async function clearOfflineSnapshot(): Promise<void> {
  if (!isOfflineStorageSupported()) return;
  await caches.delete(DATA_CACHE);
}

/**
 * Çevrimdışı sayfanın kendisini ve bağlı olduğu JS/CSS dosyalarını önbelleğe
 * alır. Bunlar kullanıcıdan bağımsız olduğu için kişisel veri kovasına değil
 * varlık kovasına yazılır — çıkışta silinmezler.
 *
 * Sayfanın HTML'i alınmadan bağlantısız açılamaz; script/link etiketleri de
 * çözülmeden sayfa boş ekran olarak gelir.
 */
export async function cacheOfflineShell(): Promise<void> {
  if (!isOfflineStorageSupported()) return;

  const response = await fetch(OFFLINE_PAGE, { credentials: "omit" });
  if (!response.ok) {
    throw new Error(`Çevrimdışı sayfa alınamadı (${response.status}).`);
  }

  const html = await response.clone().text();
  const cache = await caches.open(SHELL_CACHE);
  await cache.put(OFFLINE_PAGE, response);

  const doc = new DOMParser().parseFromString(html, "text/html");
  const assetUrls = new Set<string>();
  doc.querySelectorAll<HTMLScriptElement>("script[src]").forEach((el) => assetUrls.add(el.src));
  doc
    .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')
    .forEach((el) => assetUrls.add(el.href));

  await Promise.all(
    Array.from(assetUrls)
      .filter((url) => new URL(url, location.origin).origin === location.origin)
      .map(async (url) => {
        try {
          const asset = await fetch(url);
          if (asset.ok) await cache.put(url, asset);
        } catch {
          // Tek bir varlığın alınamaması senkronun tamamını başarısız saymaz.
        }
      })
  );
}
