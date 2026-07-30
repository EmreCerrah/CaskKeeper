import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { notificationService } from "@/server/services/NotificationService";
import { MobileTabBar } from "./MobileTabBar";

/**
 * Mobil alt sekme çubuğunun sunucu tarafı sarmalayıcısı — oturumu ve okunmamış
 * bildirim sayısını okuyup istemci bileşenine geçirir.
 */
export async function MobileNav() {
  const session = await getSession();

  let unreadCount = 0;
  if (session) {
    await connectToDatabase();
    unreadCount = await notificationService.countUnread(session.userId);
  }

  return (
    <MobileTabBar
      isAuthenticated={Boolean(session)}
      isAdmin={session?.role === "admin"}
      userId={session?.userId}
      unreadCount={unreadCount}
    />
  );
}
