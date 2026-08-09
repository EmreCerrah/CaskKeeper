import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { followService } from "@/server/services/FollowService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** GET /api/users/[id]/following — kullanıcının takip ettikleri (herkese açık) */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const following = await followService.getFollowing(params.id);
    return createResponse(following, "Takip edilenler listelendi");
  } catch (error) {
    return handleApiError(error);
  }
}
