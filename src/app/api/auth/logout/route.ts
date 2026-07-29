import { createResponse } from "@/lib/api-response";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  clearSessionCookie();
  return createResponse(null, "Çıkış yapıldı");
}
