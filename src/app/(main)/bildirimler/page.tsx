import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BellOff } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { notificationService } from "@/server/services/NotificationService";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import { getTranslations } from "@/lib/i18n/server";
import { Pagination } from "@/components/shared/Pagination";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("notifications.title") };
}
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

  const t = getTranslations();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">{t("notifications.title")}</h1>
          <p className="mt-1 text-muted-foreground">
            {notifications.unreadCount > 0
              ? t("notifications.unreadCount", { count: notifications.unreadCount })
              : t("notifications.allRead")}
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
          <p className="font-medium">{t("notifications.empty")}</p>
          <p className="mt-1 text-sm">
            {t("notifications.emptyHint")}
          </p>
        </div>
      )}
    </div>
  );
}
