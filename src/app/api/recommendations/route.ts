import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { recommendationService } from "@/server/services/RecommendationService";

export const dynamic = "force-dynamic";

/** GET /api/recommendations — damak profiline göre viski önerileri */
export async function GET() {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const recommendations = await recommendationService.getRecommendations(session.userId);
    return createResponse(recommendations);
  } catch (error) {
    return handleApiError(error);
  }
}
