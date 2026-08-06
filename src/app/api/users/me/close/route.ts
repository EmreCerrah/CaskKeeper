import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession, clearSessionCookie } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";

export const dynamic = "force-dynamic";

/**
 * POST /api/users/me/close — hesabı kalıcı olarak kapatır.
 *
 * DELETE değil: gövdede parola taşıyor ve bu bir kayıt silme değil, durum
 * değişikliği — veriler yerinde kalıp görünürlükten çıkıyor.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const body = await req.json().catch(() => ({}));
    await userService.closeAccount(session.userId, body?.password);

    // Oturum aynı istekte düşürülür; bu cihazda geriye bir şey kalmaz.
    clearSessionCookie();

    return createResponse(null, "Hesabınız kapatıldı");
  } catch (error) {
    return handleApiError(error);
  }
}
