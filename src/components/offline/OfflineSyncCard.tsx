"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudDownload, Trash2, WifiOff } from "lucide-react";
import type { TastingNoteDTO, WishlistItemDTO } from "@/lib/types/dto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cacheOfflineShell,
  clearOfflineSnapshot,
  getSnapshotMeta,
  isOfflineStorageSupported,
  saveOfflineSnapshot,
  type OfflineSnapshotMeta,
} from "@/lib/offline/store";

/** Tek seferde indirilecek azami kayıt — cihazda sınırsız veri biriktirmemek için. */
const MAX_ITEMS = 500;
const PAGE_SIZE = 100;

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

function formatSyncedAt(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OfflineSyncCardProps {
  userId: string;
  userName: string;
}

/**
 * Çevrimdışı kopyayı indirme/silme kartı.
 *
 * Veri otomatik olarak indirilmez: ortak kullanılan bir cihazda kimsenin
 * istemeden kişisel verisi diske yazılmasın diye indirme kullanıcının açık
 * eylemine bağlıdır.
 */
export function OfflineSyncCard({ userId, userName }: OfflineSyncCardProps) {
  const [meta, setMeta] = useState<OfflineSnapshotMeta | null>(null);
  const [supported, setSupported] = useState(true);
  const [busy, setBusy] = useState<"sync" | "clear" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOfflineStorageSupported()) {
      setSupported(false);
      return;
    }
    getSnapshotMeta().then(setMeta);
  }, []);

  const handleSync = useCallback(async () => {
    setBusy("sync");
    setError(null);
    try {
      const [notes, wishlist] = await Promise.all([
        fetchAllPages<TastingNoteDTO>("/api/tasting-notes"),
        fetchAllPages<WishlistItemDTO>("/api/wishlist"),
      ]);
      // Sayfanın kendisi de önbelleğe alınmazsa bağlantısızken açılamaz.
      await cacheOfflineShell();
      setMeta(await saveOfflineSnapshot({ userId, userName, notes, wishlist }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Veriler indirilemedi.");
    } finally {
      setBusy(null);
    }
  }, [userId, userName]);

  const handleClear = useCallback(async () => {
    setBusy("clear");
    setError(null);
    try {
      await clearOfflineSnapshot();
      setMeta(null);
    } catch {
      setError("Çevrimdışı veri silinemedi.");
    } finally {
      setBusy(null);
    }
  }, []);

  return (
    <Card className="bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <WifiOff className="h-4 w-4" aria-hidden />
          Çevrimdışı Kullanım
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tadım notlarınızı ve istek listenizi bu cihaza indirin; internet
          bağlantınız olmadığında da okuyabilirsiniz. Veriler yalnızca siz
          indirdiğinizde kaydedilir ve çıkış yaptığınızda silinir.
        </p>

        {!supported ? (
          <p className="text-sm text-muted-foreground">
            Bu tarayıcı çevrimdışı kaydı desteklemiyor.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSync} disabled={busy !== null}>
                <CloudDownload className="mr-2 h-4 w-4" aria-hidden />
                {busy === "sync" ? "İndiriliyor…" : "Verilerimi indir"}
              </Button>

              {meta && (
                <Button variant="ghost" onClick={handleClear} disabled={busy !== null}>
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                  {busy === "clear" ? "Siliniyor…" : "Çevrimdışı veriyi sil"}
                </Button>
              )}
            </div>

            {meta ? (
              <p className="text-sm text-muted-foreground">
                Son senkron:{" "}
                <span className="font-medium text-foreground">
                  {formatSyncedAt(meta.syncedAt)}
                </span>{" "}
                · {meta.noteCount} tadım notu, {meta.wishlistCount} istek listesi kaydı
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Bu cihazda kayıtlı çevrimdışı veri yok.
              </p>
            )}
          </>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
