import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/search?q=... — isme göre kullanıcı arar.
 * Oturum zorunlu değildir; giriş yapılmışsa takip durumu da döner.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    await connectToDatabase();

    const query = req.nextUrl.searchParams.get("q") ?? "";
    const users = await userService.searchUsers(query, session?.userId);

    return createResponse(users, "Kullanıcılar listelendi");
  } catch (error) {
    return handleApiError(error);
  }
}
