import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { wishlistService } from "@/server/services/WishlistService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { whiskeyId: string };
}

/** POST /api/wishlist/[whiskeyId] — istek listesine ekle */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    await wishlistService.add(session.userId, params.whiskeyId);
    return createResponse({ wishlisted: true }, "İstek listesine eklendi");
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/wishlist/[whiskeyId] — istek listesinden kaldır */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    await wishlistService.remove(session.userId, params.whiskeyId);
    return createResponse({ wishlisted: false }, "İstek listesinden kaldırıldı");
  } catch (error) {
    return handleApiError(error);
  }
}
