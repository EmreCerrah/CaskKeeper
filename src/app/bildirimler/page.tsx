import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BellOff } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { notificationService } from "@/server/services/NotificationService";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import { Pagination } from "@/components/shared/Pagination";

export const metadata: Metadata = { title: "Bildirimler" };
export const dynamic = "force-dynamic";

interface NotificationsPageProps {
  searchParams: { sayfa?: string };
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/bildirimler");

  await connectToDatabase();

  const page = Math.max(1, Number(searchParams.sayfa) || 1);
  const notifications = await notificationService.list(session.userId, { page, limit: 20 });

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Bildirimler</h1>
          <p className="mt-1 text-muted-foreground">
            {notifications.unreadCount > 0
              ? `${notifications.unreadCount} okunmamış bildiriminiz var.`
              : "Tüm bildirimleriniz okundu."}
          </p>
        </div>
        <MarkAllReadButton unreadCount={notifications.unreadCount} />
      </div>

      {notifications.data.length > 0 ? (
        <>
          <div className="space-y-2">
            {notifications.data.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
          <Pagination
            page={notifications.page}
            totalPages={notifications.totalPages}
            basePath="/bildirimler"
          />
        </>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <BellOff className="mx-auto mb-3 h-10 w-10 text-primary/50" aria-hidden />
          <p className="font-medium">Henüz bildiriminiz yok.</p>
          <p className="mt-1 text-sm">
            Biri sizi takip ettiğinde, tadımınızı beğendiğinde ya da yorumladığında burada görünür.
          </p>
        </div>
      )}
    </div>
  );
}
