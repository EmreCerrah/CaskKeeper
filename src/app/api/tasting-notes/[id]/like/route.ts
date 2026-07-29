import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { interactionService } from "@/server/services/InteractionService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** POST /api/tasting-notes/[id]/like — beğen */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const interactions = await interactionService.like(session.userId, params.id);
    return createResponse(interactions, "Beğenildi");
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/tasting-notes/[id]/like — beğeniyi kaldır */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const interactions = await interactionService.unlike(session.userId, params.id);
    return createResponse(interactions, "Beğeni kaldırıldı");
  } catch (error) {
    return handleApiError(error);
  }
}
