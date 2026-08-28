import type { TastingNoteDTO, WishlistItemDTO } from "@/lib/types/dto";

/**
 * @file store.ts
 * @description Storing the offline copy the user asked for on their device.
 *
 * The Cache API does the storing; no IndexedDB wrapper was written — what is
 * kept is two JSON payloads, so a separate abstraction would be code for its
 * own sake. The data lives in a bucket SEPARATE from the asset cache: signing
 * out deletes only the personal data, and the cached static assets stay.
 */

/** The personal-data bucket — wiped entirely on sign-out. */
const DATA_CACHE = "caskkeeper-offline-v1";

/**
 * The static asset bucket. It has to MATCH CACHE_VERSION in public/sw.js; the
 * service worker is plain JS and cannot import from here. Change one and you
 * must change the other.
 */
const SHELL_CACHE = "caskkeeper-v1";

/** The offline page's address — the service worker serves it when navigation fails. */
export const OFFLINE_PAGE = "/offline";

const KEY_NOTES = "/__offline/tasting-notes";
const KEY_WISHLIST = "/__offline/wishlist";
const KEY_META = "/__offline/meta";

export interface OfflineSnapshotMeta {
  /** Whose copy this is — stated plainly on the offline page. */
  userId: string;
  userName: string;
  /** An ISO date. */
  syncedAt: string;
  noteCount: number;
  wishlistCount: number;
}

export interface OfflineSnapshot {
  meta: OfflineSnapshotMeta;
  notes: TastingNoteDTO[];
  wishlist: WishlistItemDTO[];
}

/** Does the browser support the Cache API (also false during SSR). */
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

/** Writes the user's tasting notes and wishlist to the device. */
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

/** The header alone — enough for the "last synced" indicator. */
export async function getSnapshotMeta(): Promise<OfflineSnapshotMeta | null> {
  if (!isOfflineStorageSupported()) return null;
  const cache = await caches.open(DATA_CACHE);
  return readJson<OfflineSnapshotMeta>(cache, KEY_META);
}

/** The whole stored copy. Returns null when it is missing or corrupt. */
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

/** Deletes the personal data. Called on sign-out and by the "delete" button. */
export async function clearOfflineSnapshot(): Promise<void> {
  if (!isOfflineStorageSupported()) return;
  await caches.delete(DATA_CACHE);
}

/**
 * Caches the offline page itself along with the JS and CSS it depends on.
 * None of it is user-specific, so it goes to the asset bucket rather than the
 * personal one and survives sign-out.
 *
 * Without the page's HTML it cannot open with no connection; without resolving
 * its script and link tags the page arrives as a blank screen.
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
          // One asset failing to fetch does not fail the whole sync.
        }
      })
  );
}
