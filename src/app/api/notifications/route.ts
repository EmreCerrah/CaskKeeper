import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { notificationService } from "@/server/services/NotificationService";

export const dynamic = "force-dynamic";

/** GET /api/notifications — kullanıcının bildirimleri ve okunmamış sayısı */
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const params = req.nextUrl.searchParams;
    const notifications = await notificationService.list(session.userId, {
      page: params.get("page") ? Number(params.get("page")) : undefined,
      limit: params.get("limit") ? Number(params.get("limit")) : undefined,
    });

    return createResponse(notifications);
  } catch (error) {
    return handleApiError(error);
  }
}
