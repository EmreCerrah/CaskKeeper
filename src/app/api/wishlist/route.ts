import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { wishlistService } from "@/server/services/WishlistService";

export const dynamic = "force-dynamic";

/** GET /api/wishlist — kullanıcının istek listesi */
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const params = req.nextUrl.searchParams;
    const wishlist = await wishlistService.getWishlist(session.userId, {
      page: params.get("page") ? Number(params.get("page")) : undefined,
      limit: params.get("limit") ? Number(params.get("limit")) : undefined,
    });

    return createResponse(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}
