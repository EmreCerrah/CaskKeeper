import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { analyticsService } from "@/server/services/AnalyticsService";

export const dynamic = "force-dynamic";

/** GET /api/analytics — aroma trendi ve katalog dağılımı */
export async function GET() {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const analytics = await analyticsService.getAnalytics(session.userId);
    return createResponse(analytics);
  } catch (error) {
    return handleApiError(error);
  }
}
