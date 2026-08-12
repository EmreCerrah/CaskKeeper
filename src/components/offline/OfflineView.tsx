"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GlassWater, NotebookPen, Bookmark, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TastingNoteCard } from "@/components/tasting/TastingNoteCard";
import { WhiskeyCard } from "@/components/whiskey/WhiskeyCard";
import { readOfflineSnapshot, type OfflineSnapshot } from "@/lib/offline/store";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import { INTL_LOCALE, type Locale } from "@/lib/i18n/config";

type Tab = "notes" | "wishlist";

function formatSyncedAt(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleString(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Cihaza indirilmiş kopyayı gösterir.
 *
 * Bu görünüm (main) route grubunun dışındadır: kök layout oturum okumadığı için
 * sayfa statik render edilir ve service worker tarafından önbelleğe alınabilir.
 * Bağlantı yokken açılabilen tek sayfa budur.
 */
export function OfflineView() {
  const t = useTranslations();
  const locale = useLocale();
  const [snapshot, setSnapshot] = useState<OfflineSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("notes");
  const [online, setOnline] = useState(true);

  useEffect(() => {
    readOfflineSnapshot()
      .then(setSnapshot)
      .finally(() => setLoading(false));

    let cancelled = false;

    /**
     * navigator.onLine yalnızca cihazın bir ağa bağlı olup olmadığını söyler;
     * sunucuya gerçekten ulaşılabildiğini söylemez. Ağ var ama sunucu kapalıyken
     * sayfa kendini çevrimiçi sanardı: "panele dön" bağlantısı görünür, kart
     * içindeki linkler açık kalır ve kullanıcı hata sayfasına düşerdi.
     * Bu yüzden erişilebilirlik ayrıca yoklanıyor.
     */
    const probe = async () => {
      if (!navigator.onLine) {
        if (!cancelled) setOnline(false);
        return;
      }
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 3000);
      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
          signal: abort.signal,
        });
        if (!cancelled) setOnline(response.ok);
      } catch {
        if (!cancelled) setOnline(false);
      } finally {
        clearTimeout(timer);
      }
    };

    probe();
    window.addEventListener("online", probe);
    window.addEventListener("offline", probe);
    return () => {
      cancelled = true;
      window.removeEventListener("online", probe);
      window.removeEventListener("offline", probe);
    };
  }, []);

  /**
   * Kartların içindeki bağlantılar sunucuya gider; bağlantı yokken tıklanırsa
   * kullanıcı hata sayfasına düşer. Çevrimdışıyken tıklamayı burada durduruyoruz
   * — böylece kart bileşenlerini değiştirmeye gerek kalmıyor.
   */
  const blockLinksWhenOffline = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (online) return;
      const anchor = (event.target as HTMLElement).closest("a");
      if (anchor) event.preventDefault();
    },
    [online]
  );

  if (loading) {
    return <p className="py-16 text-center text-muted-foreground">{t("offline.loading")}</p>;
  }

  if (!snapshot) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <WifiOff className="h-12 w-12 text-primary/50" aria-hidden />
        <h1 className="font-serif text-2xl font-bold">{t("offline.noDataTitle")}</h1>
        <p className="max-w-md text-muted-foreground">
          {t("offline.noDataBody")}


        </p>
        {online && (
          <Button asChild>
            <Link href="/dashboard">{t("offline.goToDashboard")}</Link>
          </Button>
        )}
      </div>
    );
  }

  const { meta, notes, wishlist } = snapshot;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <GlassWater className="h-6 w-6 text-primary" aria-hidden />
          <span className="font-serif text-xl font-bold text-gold-gradient">CaskKeeper</span>
          {!online && (
            <Badge variant="outline" className="ml-1">
              {t("common.offline")}
            </Badge>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/60 p-3 text-sm text-muted-foreground">
          {t("offline.copyOwner", { name: meta.userName, date: formatSyncedAt(meta.syncedAt, locale) })}

        </div>

        {online && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">{t("offline.backOnline")}</Link>
          </Button>
        )}
      </header>

      <div className="flex gap-2" role="tablist">
        <Button
          role="tab"
          aria-selected={tab === "notes"}
          variant={tab === "notes" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("notes")}
        >
          <NotebookPen className="mr-2 h-4 w-4" aria-hidden />
          {t("offline.tabNotes", { count: notes.length })}
        </Button>
        <Button
          role="tab"
          aria-selected={tab === "wishlist"}
          variant={tab === "wishlist" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("wishlist")}
        >
          <Bookmark className="mr-2 h-4 w-4" aria-hidden />
          {t("offline.tabWishlist", { count: wishlist.length })}
        </Button>
      </div>

      <div onClickCapture={blockLinksWhenOffline}>
        {tab === "notes" ? (
          notes.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {t("offline.noNotes")}
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <TastingNoteCard key={note.id} note={note} showActions={false} />
              ))}
            </div>
          )
        ) : wishlist.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            {t("offline.emptyWishlist")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => (
              <WhiskeyCard key={item.whiskey.id} whiskey={item.whiskey} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
