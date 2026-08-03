import type { TastingNoteDTO, WishlistItemDTO } from "@/lib/types/dto";
import { cacheOfflineShell, saveOfflineSnapshot, type OfflineSnapshotMeta } from "./store";

/**
 * @file sync.ts
 * @description Çevrimdışı kopyanın sunucudan çekilip cihaza yazılması.
 *
 * Anahtar açıkken bu iş üç yerden tetiklenir: uygulama açılışı, sekmeye geri
 * dönüş ve veriyi değiştiren her işlem (not ekleme/düzenleme/silme, favori,
 * istek listesi). Böylece kopya pratikte güncel kalır.
 *
 * SINIR: tarayıcı kapalıyken arka planda senkron yapılamaz. Uygulama
 * kapatıldıktan sonra kopya o anki haliyle donar.
 */

/** Tek seferde saklanacak azami kayıt — cihazda sınırsız veri biriktirmemek için. */
const MAX_ITEMS = 500;
const PAGE_SIZE = 100;

/** Art arda gelen tetiklemelerin sunucuyu dövmesini engelleyen asgari aralık. */
const MIN_INTERVAL_MS = 30_000;

const DATA_CHANGED_EVENT = "caskkeeper:offline-data-changed";

interface PagedEnvelope<T> {
  data: { data: T[]; totalPages: number };
}

/** Sayfalı bir ucun tüm sayfalarını MAX_ITEMS sınırına kadar toplar. */
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
  /** Kullanıcı elle "şimdi güncelle" dediğinde aralık kuralı atlanır. */
  force?: boolean;
}

/**
 * Kullanıcının notlarını ve istek listesini indirip cihaza yazar.
 *
 * Aynı anda birden fazla tetikleme gelirse (ör. açılış + veri değişikliği)
 * tek bir istek çalışır; ayrıca MIN_INTERVAL_MS içinde tekrar çağrılırsa
 * atlanır — `force` ile bu kural devre dışı bırakılır.
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
    // Sayfanın kendisi önbelleğe alınmazsa bağlantısızken açılamaz.
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
 * Kullanıcının verisini değiştiren işlemlerden sonra çağrılır. Anahtar kapalıysa
 * dinleyici zaten yoktur ve hiçbir şey olmaz.
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

/** Testler ve anahtar kapatıldığında aralık sayacını sıfırlar. */
export function resetSyncThrottle(): void {
  lastSyncAt = 0;
}
