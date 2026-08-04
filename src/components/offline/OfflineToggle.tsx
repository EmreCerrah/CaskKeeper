"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { clearOfflineSnapshot } from "@/lib/offline/store";
import { isOfflineEnabled, setOfflineEnabled, subscribeOfflinePreference } from "@/lib/offline/preference";
import { resetSyncThrottle, syncOfflineSnapshot } from "@/lib/offline/sync";
import { useTranslations } from "@/lib/i18n/client";

interface OfflineToggleProps {
  userId: string;
  userName: string;
  /** Menü içinde satır olarak mı, yoksa kart içinde tek başına mı duruyor. */
  variant?: "menu" | "standalone";
}

/**
 * Çevrimdışı kullanım anahtarı.
 *
 * Açıldığında veri hemen indirilir ve açık kaldığı sürece güncel tutulur;
 * kapatıldığında cihazdaki kopya ANINDA silinir — yarı kapalı bir durum
 * bırakılmaz. Varsayılan kapalıdır.
 */
export function OfflineToggle({ userId, userName, variant = "menu" }: OfflineToggleProps) {
  const t = useTranslations();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(isOfflineEnabled());
    return subscribeOfflinePreference(setEnabled);
  }, []);

  async function toggle() {
    const next = !enabled;
    setBusy(true);
    setError(null);

    // Anahtar hemen tepki versin; hata olursa geri alınır.
    setEnabled(next);
    setOfflineEnabled(next);

    try {
      if (next) {
        resetSyncThrottle();
        await syncOfflineSnapshot({ userId, userName, force: true });
      } else {
        await clearOfflineSnapshot();
        resetSyncThrottle();
      }
    } catch (e) {
      setEnabled(!next);
      setOfflineEnabled(!next);
      setError(e instanceof Error ? e.message : t("offline.actionFailed"));
    } finally {
      setBusy(false);
    }
  }

  const label = enabled ? t("offline.switchOnLabel") : t("offline.switchOffLabel");

  return (
    <div className={cn(variant === "menu" && "border-t border-border/60")}>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={toggle}
        disabled={busy}
        className={cn(
          "flex w-full items-center gap-2 text-left text-sm hover:bg-accent disabled:opacity-60",
          variant === "menu" ? "px-4 py-2.5" : "min-h-11 rounded-md px-3 md:min-h-0"
        )}
      >
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1">{t("offline.title")}</span>

        {/* Durum yalnızca renkle anlatılmaz; anahtarın yanında metin de var. */}
        <span className="text-xs text-muted-foreground">{enabled ? t("offline.on") : t("offline.off")}</span>
        <span
          aria-hidden
          className={cn(
            "relative h-5 w-9 shrink-0 rounded-full transition-colors",
            enabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform",
              enabled ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </span>
      </button>

      {error && (
        <p role="alert" className="px-4 pb-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
