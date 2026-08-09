import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/users/[id]/notes — bir kullanıcının HERKESE AÇIK tadım notları.
 * Query: page, limit
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    await connectToDatabase();

    const search = req.nextUrl.searchParams;
    const notes = await tastingNoteService.getPublicNotesByUser(
      params.id,
      {
        page: search.get("page") ? Number(search.get("page")) : undefined,
        limit: search.get("limit") ? Number(search.get("limit")) : undefined,
      },
      session?.userId
    );

    return createResponse(notes, "Tadım notları listelendi");
  } catch (error) {
    return handleApiError(error);
  }
}
