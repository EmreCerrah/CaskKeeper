import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { notificationService } from "@/server/services/NotificationService";

export const dynamic = "force-dynamic";

/** POST /api/notifications/read-all — tüm bildirimleri okundu işaretle */
export async function POST(_req: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const marked = await notificationService.markAllRead(session.userId);
    return createResponse({ marked }, "Bildirimler okundu olarak işaretlendi");
  } catch (error) {
    return handleApiError(error);
  }
}
