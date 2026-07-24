import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession, createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";

export const dynamic = "force-dynamic";

/** PATCH /api/users/me — profil güncelleme */
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const body = await req.json();
    const user = await userService.updateProfile(session.userId, body);

    // İsim değiştiyse oturum token'ını tazele (navbar güncel kalsın)
    if (user.name !== session.name) {
      const token = await createSessionToken({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      setSessionCookie(token);
    }

    return createResponse(user, "Profiliniz güncellendi");
  } catch (error) {
    return handleApiError(error);
  }
}
