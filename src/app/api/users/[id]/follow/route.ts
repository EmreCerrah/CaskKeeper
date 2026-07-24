import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { followService } from "@/server/services/FollowService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** POST /api/users/[id]/follow — takip et */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    await followService.follow(session.userId, params.id);
    return createResponse({ following: true }, "Takip edildi");
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/users/[id]/follow — takibi bırak */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    await followService.unfollow(session.userId, params.id);
    return createResponse({ following: false }, "Takip bırakıldı");
  } catch (error) {
    return handleApiError(error);
  }
}
