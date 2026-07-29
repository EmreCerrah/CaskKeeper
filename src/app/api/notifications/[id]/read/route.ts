import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { notificationService } from "@/server/services/NotificationService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** POST /api/notifications/[id]/read — tek bildirimi okundu işaretle */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    await notificationService.markRead(params.id, session.userId);
    return createResponse({ isRead: true }, "Bildirim okundu olarak işaretlendi");
  } catch (error) {
    return handleApiError(error);
  }
}
