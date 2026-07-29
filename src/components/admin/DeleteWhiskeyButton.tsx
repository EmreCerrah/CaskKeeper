"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface DeleteWhiskeyButtonProps {
  slug: string;
  label: string;
}

/** Katalogdan viski siler — iki aşamalı onay ister. */
export function DeleteWhiskeyButton({ slug, label }: DeleteWhiskeyButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }

    setBusy(true);
    setError(null);
    const res = await fetch(`/api/whiskeys/${slug}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.message ?? "Silinemedi");
      setBusy(false);
      setConfirming(false);
      return;
    }

    setBusy(false);
    setConfirming(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={busy}
        title={confirming ? `"${label}" silinecek — onaylamak için tekrar tıklayın` : "Sil"}
        className={cn(confirming && "bg-destructive/20")}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Trash2
            className={cn("h-4 w-4", confirming ? "text-destructive-foreground" : "text-muted-foreground")}
            aria-hidden
          />
        )}
      </Button>
      {confirming && !busy && <span className="text-xs text-destructive-foreground/90">Emin misiniz?</span>}
      {error && <span className="text-xs text-destructive-foreground/90">{error}</span>}
    </div>
  );
}
