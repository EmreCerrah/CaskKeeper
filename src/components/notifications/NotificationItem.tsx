"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import type { NotificationDTO } from "@/lib/types/dto";
import { UserAvatar } from "@/components/social/UserAvatar";
import { formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

const ICONS = {
  follow: UserPlus,
  like: Heart,
  comment: MessageCircle,
} as const;

/** Bildirimin yönlendirdiği sayfa: takip → profil, beğeni/yorum → tadım notu. */
function targetHref(notification: NotificationDTO): string {
  if (notification.type === "follow") return `/kullanicilar/${notification.actor.id}`;
  if (notification.tastingNoteId) return `/tadimlar/${notification.tastingNoteId}`;
  return `/kullanicilar/${notification.actor.id}`;
}

/** Bildirim metni — viski adı biliniyorsa cümleye eklenir. */
function describe(notification: NotificationDTO): string {
  const target = notification.whiskeyLabel
    ? `“${notification.whiskeyLabel}” tadımınızı`
    : "tadım notunuzu";

  switch (notification.type) {
    case "follow":
      return "sizi takip etmeye başladı";
    case "like":
      return `${target} beğendi`;
    case "comment":
      return `${target} yorumladı`;
  }
}

interface NotificationItemProps {
  notification: NotificationDTO;
}

/** Tek bildirim satırı — tıklandığında okundu işaretlenip hedefe gider. */
export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(notification.isRead);

  const Icon = ICONS[notification.type];

  async function handleClick() {
    if (isRead) return;
    setIsRead(true);
    await fetch(`/api/notifications/${notification.id}/read`, { method: "POST" });
    router.refresh();
  }

  return (
    <Link
      href={targetHref(notification)}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-accent/50",
        isRead ? "border-border/60" : "border-primary/40 bg-primary/5"
      )}
    >
      <UserAvatar
        name={notification.actor.name}
        src={notification.actor.profilePicture}
        size="sm"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{notification.actor.name}</span>{" "}
          <span className="text-muted-foreground">{describe(notification)}</span>
        </p>

        {notification.commentExcerpt && (
          <p className="mt-1 truncate text-sm italic text-muted-foreground">
            “{notification.commentExcerpt}”
          </p>
        )}

        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-primary/70" aria-hidden />
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {!isRead && (
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
          aria-label="Okunmamış"
        />
      )}
    </Link>
  );
}
