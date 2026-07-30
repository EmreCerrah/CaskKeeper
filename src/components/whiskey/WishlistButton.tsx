"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WishlistButtonProps {
  whiskeyId: string;
  initialWishlisted: boolean;
}

/** İstek listesine ekle / kaldır butonu — sunucu yanıtını bekler, iyimser değil. */
export function WishlistButton({ whiskeyId, initialWishlisted }: WishlistButtonProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const res = await fetch(`/api/wishlist/${whiskeyId}`, {
      method: wishlisted ? "DELETE" : "POST",
    });
    if (res.ok) {
      setWishlisted((v) => !v);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <Button onClick={toggle} disabled={busy} variant={wishlisted ? "outline" : "default"} size="lg">
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : wishlisted ? (
        <BookmarkCheck className="h-4 w-4" aria-hidden />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden />
      )}
      {wishlisted ? "İstek Listemde" : "İstek Listeme Ekle"}
    </Button>
  );
}
