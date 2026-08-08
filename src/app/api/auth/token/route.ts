import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { getClientIp } from "@/lib/request-ip";
import { authService } from "@/server/services/AuthService";
import { rateLimitService } from "@/server/services/RateLimitService";
import { createSessionToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/token — native istemciler için giriş.
 *
 * /api/auth/login'den farkı: çerez YAZMAZ, token'ı gövdede döner. Mobil
 * uygulamada çerez kavramı yok; token cihazın güvenli deposunda (Keychain /
 * Keystore) tutulur ve `Authorization: Bearer` ile gönderilir.
 *
 * Neden ayrı bir uç: token'ı /api/auth/login'in yanıtına eklemek, web'de bir
 * XSS'in ÇALINABİLİR ve taşınabilir bir kimlik bilgisi ele geçirmesi demekti —
 * bugün httpOnly çerez okunamadığı için o yol yok. Ayrım aynı zamanda
 * "tarayıcı çerez, native token" kuralını kodda görünür kılıyor.
 */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Hız sınırı giriş ile ortak: aksi halde bu uç, login'e konan sınırın
    // etrafından dolaşmanın yolu olurdu.
    const ip = getClientIp(req);
    const email = typeof body?.email === "string" ? body.email : "";

    await rateLimitService.checkLogin(ip, email);

    const user = await authService.login(body);

    await rateLimitService.clearLogin(ip, email);

    const token = await createSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return createResponse({ token, user }, "Giriş başarılı");
  } catch (error) {
    return handleApiError(error);
  }
}
