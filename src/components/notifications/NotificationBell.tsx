import Link from "next/link";
import { Bell } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { notificationService } from "@/server/services/NotificationService";

interface NotificationBellProps {
  userId: string;
}

/**
 * Gezinme çubuğundaki bildirim zili (server component).
 * Okunmamış sayısı her sayfa oluşturmada veritabanından okunur.
 */
export async function NotificationBell({ userId }: NotificationBellProps) {
  await connectToDatabase();
  const unreadCount = await notificationService.countUnread(userId);

  const label =
    unreadCount > 0 ? `Bildirimler — ${unreadCount} okunmamış` : "Bildirimler";

  return (
    <Link
      href="/bildirimler"
      title={label}
      aria-label={label}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
    >
      <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold tabular-nums text-primary-foreground">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
