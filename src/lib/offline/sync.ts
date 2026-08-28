import type { TastingNoteDTO, WishlistItemDTO } from "@/lib/types/dto";
import { cacheOfflineShell, saveOfflineSnapshot, type OfflineSnapshotMeta } from "./store";

/**
 * @file sync.ts
 * @description Fetching the offline copy from the server and writing it to the
 * device.
 *
 * While the switch is on, three things trigger this: the app starting, the tab
 * regaining focus, and any operation that changes the data (writing, editing or
 * deleting a note, favouriting, the wishlist). In practice that keeps the copy
 * current.
 *
 * THE LIMIT: nothing syncs in the background while the browser is closed. Once
 * the app is shut, the copy freezes as it was.
 */

/** The most records stored at once — so the device does not accumulate data without bound. */
const MAX_ITEMS = 500;
const PAGE_SIZE = 100;

/** The minimum gap that stops back-to-back triggers hammering the server. */
const MIN_INTERVAL_MS = 30_000;

const DATA_CHANGED_EVENT = "caskkeeper:offline-data-changed";

interface PagedEnvelope<T> {
  data: { data: T[]; totalPages: number };
}

/** Collects every page of a paginated endpoint, up to the MAX_ITEMS limit. */
async function fetchAllPages<T>(path: string): Promise<T[]> {
  const collected: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetch(`${path}?page=${page}&limit=${PAGE_SIZE}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`${path} alınamadı (${response.status}).`);

    const payload = (await response.json()) as PagedEnvelope<T>;
    collected.push(...payload.data.data);
    totalPages = payload.data.totalPages;
    page += 1;
  } while (page <= totalPages && collected.length < MAX_ITEMS);

  return collected.slice(0, MAX_ITEMS);
}

let lastSyncAt = 0;
let inFlight: Promise<OfflineSnapshotMeta> | null = null;

export interface SyncOptions {
  userId: string;
  userName: string;
  /** When the user asks to "sync now" by hand, the interval rule is skipped. */
  force?: boolean;
}

/**
 * Downloads the user's notes and wishlist and writes them to the device.
 *
 * If several triggers arrive at once — startup plus a data change, say — only
 * one request runs; and a call inside MIN_INTERVAL_MS is skipped, unless
 * `force` waives that rule.
 */
export async function syncOfflineSnapshot(
  options: SyncOptions
): Promise<OfflineSnapshotMeta | null> {
  if (inFlight) return inFlight;

  const now = Date.now();
  if (!options.force && now - lastSyncAt < MIN_INTERVAL_MS) return null;

  inFlight = (async () => {
    const [notes, wishlist] = await Promise.all([
      fetchAllPages<TastingNoteDTO>("/api/tasting-notes"),
      fetchAllPages<WishlistItemDTO>("/api/wishlist"),
    ]);
    // Without caching the page itself, it cannot open with no connection.
    await cacheOfflineShell();
    return saveOfflineSnapshot({
      userId: options.userId,
      userName: options.userName,
      notes,
      wishlist,
    });
  })();

  try {
    const meta = await inFlight;
    lastSyncAt = Date.now();
    return meta;
  } finally {
    inFlight = null;
  }
}

/**
 * Called after any operation that changes the user's data. With the switch off
 * there is no listener, so nothing happens.
 */
export function notifyOfflineDataChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
}

export function subscribeOfflineDataChanged(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(DATA_CHANGED_EVENT, callback);
  return () => window.removeEventListener(DATA_CHANGED_EVENT, callback);
}

/** Resets the interval counter — for tests, and when the switch is turned off. */
export function resetSyncThrottle(): void {
  lastSyncAt = 0;
}
