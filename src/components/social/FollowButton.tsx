"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/client";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
}

/** Takip et / takibi bırak butonu — iyimser değil, sunucu yanıtını bekler. */
export function FollowButton({ targetUserId, initialFollowing }: FollowButtonProps) {
  const router = useRouter();
  const t = useTranslations();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const res = await fetch(`/api/users/${targetUserId}/follow`, {
      method: following ? "DELETE" : "POST",
    });
    if (res.ok) {
      setFollowing((v) => !v);
      router.refresh(); // takipçi sayısı güncellensin
    }
    setBusy(false);
  }

  return (
    <Button onClick={toggle} disabled={busy} variant={following ? "outline" : "default"}>
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : following ? (
        <UserMinus className="h-4 w-4" aria-hidden />
      ) : (
        <UserPlus className="h-4 w-4" aria-hidden />
      )}
      {following ? t("people.unfollow") : t("people.follow")}
    </Button>
  );
}
