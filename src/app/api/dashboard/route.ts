import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";

export const dynamic = "force-dynamic";

/** GET /api/dashboard — oturum sahibinin tadım istatistikleri */
export async function GET() {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const stats = await tastingNoteService.getDashboardStats(session.userId);
    return createResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
