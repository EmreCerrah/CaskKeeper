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

    // IP'yi çıkarmak bir HTTP işi olduğu için route'ta; kuralın kendisi serviste.
    const ip = getClientIp(req);
    const email = typeof body?.email === "string" ? body.email : "";

    // Parola karşılaştırmasından ÖNCE: her başarısız deneme ~450 ms bcrypt
    // hesabı demek, sınırı aşan istek o maliyete hiç girmemeli.
    await rateLimitService.checkLogin(ip, email);

    const user = await authService.login(body);

    // Parola doğruydu: bu kullanıcının sayacı sıfırlanır.
    await rateLimitService.clearLogin(ip, email);

    const token = await createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setSessionCookie(token);

    return createResponse(user, "Giriş başarılı");
  } catch (error) {
    return handleApiError(error);
  }
}
