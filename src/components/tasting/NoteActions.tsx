"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { notifyOfflineDataChanged } from "@/lib/offline/sync";
import { useTranslations } from "@/lib/i18n/client";

interface NoteActionsProps {
  noteId: string;
  isFavorite: boolean;
}

/** Tadım notu kartındaki aksiyonlar: favori, düzenle, sil. */
export function NoteActions({ noteId, isFavorite }: NoteActionsProps) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [busy, setBusy] = useState(false);
  const t = useTranslations();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function toggleFavorite() {
    setBusy(true);
    const next = !favorite;
    const res = await fetch(`/api/tasting-notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: next }),
    });
    if (res.ok) {
      setFavorite(next);
      notifyOfflineDataChanged();
      router.refresh();
    }
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      // 3 saniye içinde ikinci tıklama gelmezse onayı sıfırla
      setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/tasting-notes/${noteId}`, { method: "DELETE" });
    if (res.ok) {
      notifyOfflineDataChanged();
      router.refresh();
    }
    setBusy(false);
    setConfirmingDelete(false);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFavorite}
        disabled={busy}
        title={favorite ? t("note.favoriteRemove") : t("note.favoriteAdd")}
        aria-pressed={favorite}
      >
        <Heart
          className={cn("h-4 w-4", favorite ? "fill-primary text-primary" : "text-muted-foreground")}
          aria-hidden
        />
      </Button>

      <Button asChild variant="ghost" size="icon" title={t("note.edit")}>
        <Link href={`/my-tastings/${noteId}/edit`}>
          <Pencil className="h-4 w-4 text-muted-foreground" aria-hidden />
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={busy}
        title={confirmingDelete ? t("note.deleteConfirm") : t("note.delete")}
        className={cn(confirmingDelete && "bg-destructive/20")}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Trash2
            className={cn("h-4 w-4", confirmingDelete ? "text-destructive-foreground" : "text-muted-foreground")}
            aria-hidden
          />
        )}
      </Button>
    </div>
  );
}
