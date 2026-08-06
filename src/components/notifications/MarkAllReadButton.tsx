"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/client";

interface MarkAllReadButtonProps {
  unreadCount: number;
}

/** "Tümünü okundu işaretle" — okunmamış bildirim yoksa devre dışıdır. */
export function MarkAllReadButton({ unreadCount }: MarkAllReadButtonProps) {
  const router = useRouter();
  const t = useTranslations();
  const [busy, setBusy] = useState(false);

  async function markAll() {
    setBusy(true);
    const res = await fetch("/api/notifications/read-all", { method: "POST" });
    if (res.ok) router.refresh();
    setBusy(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={markAll}
      disabled={busy || unreadCount === 0}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <CheckCheck className="h-4 w-4" aria-hidden />
      )}
      {t("notifications.markAllRead")}
    </Button>
  );
}
