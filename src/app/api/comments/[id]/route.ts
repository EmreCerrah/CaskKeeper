import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { interactionService } from "@/server/services/InteractionService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** DELETE /api/comments/[id] — yorumu sil (yazarı ya da not sahibi) */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    await interactionService.deleteComment(params.id, session.userId);
    return createResponse(null, "Yorum silindi");
  } catch (error) {
    return handleApiError(error);
  }
}
