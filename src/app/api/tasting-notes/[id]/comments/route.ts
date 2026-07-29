import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { getSession, requireSession } from "@/lib/auth/session";
import { interactionService } from "@/server/services/InteractionService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** GET /api/tasting-notes/[id]/comments — notun yorumları (oturum zorunlu değil) */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    await connectToDatabase();

    const comments = await interactionService.getComments(params.id, session?.userId);
    return createResponse(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/tasting-notes/[id]/comments — yorum ekle */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const body = await req.json();
    const comment = await interactionService.addComment(session.userId, params.id, body);

    return createResponse(comment, "Yorum eklendi", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
