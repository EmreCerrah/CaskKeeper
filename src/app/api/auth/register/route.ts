import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { getClientIp } from "@/lib/request-ip";
import { authService } from "@/server/services/AuthService";
import { rateLimitService } from "@/server/services/RateLimitService";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Toplu hesap açmayı engeller; burada e-posta bazlı sayaç yok, çünkü
    // saldırgan her denemede farklı bir adres uydurabilir.
    await rateLimitService.checkRegister(getClientIp(req));

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
