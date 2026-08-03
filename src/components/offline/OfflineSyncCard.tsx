"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSnapshotMeta, isOfflineStorageSupported, type OfflineSnapshotMeta } from "@/lib/offline/store";
import { isOfflineEnabled, subscribeOfflinePreference } from "@/lib/offline/preference";
import { subscribeOfflineDataChanged, syncOfflineSnapshot } from "@/lib/offline/sync";
import { OfflineToggle } from "./OfflineToggle";

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
 * /profil sayfasındaki çevrimdışı kullanım bölümü — anahtarın ayrıntılı hâli.
 * Anahtarın kendisi ayrıca kullanıcı menüsünde de bulunur; ikisi aynı tercihi
 * paylaşır (bkz. preference.ts).
 */
export function OfflineSyncCard({ userId, userName }: OfflineSyncCardProps) {
  const [meta, setMeta] = useState<OfflineSnapshotMeta | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMeta = useCallback(() => {
    getSnapshotMeta().then(setMeta);
  }, []);

  useEffect(() => {
    if (!isOfflineStorageSupported()) {
      setSupported(false);
      return;
    }
    setEnabled(isOfflineEnabled());
    refreshMeta();

    const unsubscribePreference = subscribeOfflinePreference((value) => {
      setEnabled(value);
      // Anahtar kapatıldığında kopya silinir; açıldığında senkron biter bitmez
      // üst bilgi tazelenmeli.
      setTimeout(refreshMeta, 300);
    });
    const unsubscribeData = subscribeOfflineDataChanged(() => setTimeout(refreshMeta, 500));

    return () => {
      unsubscribePreference();
      unsubscribeData();
    };
  }, [refreshMeta]);

  const handleManualSync = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setMeta(await syncOfflineSnapshot({ userId, userName, force: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Veriler güncellenemedi.");
    } finally {
      setBusy(false);
    }
  }, [userId, userName]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <WifiOff className="h-5 w-5 text-primary" aria-hidden />
          Çevrimdışı Kullanım
        </CardTitle>
        <CardDescription>
          Açtığınızda tadım notlarınız ve istek listeniz bu cihaza kaydedilir ve
          güncel tutulur; internet bağlantınız olmadığında da okuyabilirsiniz.
          Kapattığınızda kayıtlı kopya hemen silinir.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!supported ? (
          <p className="text-sm text-muted-foreground">
            Bu tarayıcı çevrimdışı kaydı desteklemiyor.
          </p>
        ) : (
          <>
            <div className="rounded-lg border border-border/60">
              <OfflineToggle userId={userId} userName={userName} variant="standalone" />
            </div>

            {enabled ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleManualSync} disabled={busy}>
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                  {busy ? "Güncelleniyor…" : "Şimdi güncelle"}
                </Button>
                {meta && (
                  <p className="text-sm text-muted-foreground">
                    Son senkron:{" "}
                    <span className="font-medium text-foreground">
                      {formatSyncedAt(meta.syncedAt)}
                    </span>{" "}
                    · {meta.noteCount} tadım notu, {meta.wishlistCount} istek listesi kaydı
                  </p>
                )}
              </div>
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
