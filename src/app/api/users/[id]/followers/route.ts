import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { followService } from "@/server/services/FollowService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** GET /api/users/[id]/followers — kullanıcıyı takip edenler (herkese açık) */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();

    const followers = await followService.getFollowers(params.id);
    return createResponse(followers, "Takipçiler listelendi");
  } catch (error) {
    return handleApiError(error);
  }
}
