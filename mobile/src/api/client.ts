import { acceptLanguageHeader, deviceLocale, t } from "../i18n";
import { ApiError, unwrapApiResponse } from "./response";

/**
 * @file client.ts
 * @description API'ye giden tek kapı.
 *
 * Her istekte üç şey ekler: taban adres, oturum token'ı ve cihazın dili.
 * Sonuncusu önemli — sunucu hata mesajlarını isteğin diline göre döndürüyor
 * (PR #24), yani hata metinlerini burada çevirmeye gerek kalmıyor.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  // Sessizce localhost'a düşmek en kötüsü olurdu: telefonda "localhost"
  // telefonun kendisidir, istek hiç çıkmaz ve sebebi anlaşılmaz.
  throw new Error("EXPO_PUBLIC_API_URL tanımlı değil — mobile/.env dosyasını kontrol edin.");
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Oturum token'ı; verilmezse istek anonim gider. */
  token?: string | null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": acceptLanguageHeader(deviceLocale),
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // Sunucuya hiç ulaşılamadı: gösterilecek bir sunucu mesajı da yok, bu
    // yüzden metin istemcide üretiliyor. Tek böyle yer burası.
    throw new ApiError(t("error.network"), 0);
  }

  const payload = await response.json().catch(() => null);
  return unwrapApiResponse<T>(response.status, payload, t("error.unexpected"));
}

export { ApiError };
