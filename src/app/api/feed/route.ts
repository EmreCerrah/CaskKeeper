import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";

export const dynamic = "force-dynamic";

/** GET /api/feed — takip edilen kullanıcıların herkese açık tadımları */
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const params = req.nextUrl.searchParams;
    const feed = await tastingNoteService.getFeed(session.userId, {
      page: params.get("page") ? Number(params.get("page")) : undefined,
      limit: params.get("limit") ? Number(params.get("limit")) : undefined,
    });

    return createResponse(feed, "Akış getirildi");
  } catch (error) {
    return handleApiError(error);
  }
}
