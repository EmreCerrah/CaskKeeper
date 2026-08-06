import { NextResponse } from "next/server";
import { AppError, TooManyRequestsError, ValidationError } from "@/lib/errors";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, getDictionary, type Translator, type TranslationKey } from "@/lib/i18n/translate";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
}

export function createResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    } as ApiResponse<T>,
    { status }
  );
}

export function createErrorResponse(error: unknown, message: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      message,
      error,
    } as ApiResponse<null>,
    { status }
  );
}

/**
 * Zod'un alan bazlı hatalarını çevirir.
 *
 * `fieldErrors` biçimi `{ email: ["validation.email"], … }` — şemalardaki
 * mesajlar mk() ile anahtar olarak yazıldığı için değerler de çevrilmeli.
 * Anahtar olmayan bir metin gelirse createTranslator onu olduğu gibi döndürür,
 * yani dışarıdan gelen beklenmedik bir mesaj kaybolmaz.
 */
function translateDetails(details: unknown, t: Translator): unknown {
  if (details === null || typeof details !== "object" || Array.isArray(details)) return details;

  return Object.fromEntries(
    Object.entries(details as Record<string, unknown>).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.map((m) => (typeof m === "string" ? t(m as TranslationKey) : m)) : messages,
    ])
  );
}

/**
 * Service katmanından fırlatılan tipli hataları tutarlı HTTP yanıtlarına çevirir.
 * Bilinmeyen hatalar 500 olarak döner; iç detaylar istemciye sızdırılmaz.
 *
 * Metnin dili BURADA çözülür: servisler yalnızca çeviri anahtarı taşır
 * (bkz. lib/errors.ts), dil ise isteğe ait bir bilgidir — çerez ya da
 * Accept-Language. Böylece iş kuralı katmanı dilden habersiz kalır ve
 * İngilizce arayüz kullanan biri hata anında Türkçe metinle karşılaşmaz.
 */
export function handleApiError(error: unknown) {
  const t = createTranslator(getDictionary(getLocale()));

  if (error instanceof ValidationError) {
    const message = t(error.messageKey, error.messageParams);
    return createErrorResponse(translateDetails(error.details, t) ?? error.code, message, error.status);
  }
  if (error instanceof TooManyRequestsError) {
    // İstemcinin ne zaman tekrar deneyebileceğini bilmesi için standart başlık.
    const response = createErrorResponse(error.code, t(error.messageKey, error.messageParams), error.status);
    response.headers.set("Retry-After", String(error.retryAfterSeconds));
    return response;
  }
  if (error instanceof AppError) {
    return createErrorResponse(error.code, t(error.messageKey, error.messageParams), error.status);
  }
  console.error("[api] Beklenmeyen hata:", error);
  return createErrorResponse("INTERNAL_ERROR", t("errors.unexpected"), 500);
}
