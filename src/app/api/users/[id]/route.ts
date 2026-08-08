import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/users/[id] — herkese açık profil.
 *
 * requireSession değil getSession: profil sayfası herkese açık. Oturum varsa
 * viewerId geçilir ve takip durumu (isFollowedByViewer / isMutual) dolar.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    await connectToDatabase();

    const profile = await userService.getPublicProfile(params.id, session?.userId);
    return createResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
