import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { authService } from "@/server/services/AuthService";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const user = await authService.register(body);

    // Kayıt sonrası otomatik giriş
    const token = await createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setSessionCookie(token);

    return createResponse(user, "Hesabınız oluşturuldu", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
