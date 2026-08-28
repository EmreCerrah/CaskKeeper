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
 * Translates Zod's per-field errors.
 *
 * `fieldErrors` looks like `{ email: ["validation.email"], … }` — the messages
 * in the schemas are written as keys through mk(), so the values need
 * translating too. If something arrives that is not a key, createTranslator
 * returns it unchanged, so an unexpected message from elsewhere is not lost.
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
 * Turns the typed errors thrown by the service layer into consistent HTTP
 * responses. Unknown errors come back as 500; internal detail never leaks to
 * the client.
 *
 * The language of the text is resolved HERE: services carry only a translation
 * key (see lib/errors.ts), while the language belongs to the request — a cookie
 * or Accept-Language. That keeps the business-rules layer unaware of language,
 * and means somebody on an English interface does not meet Turkish text at the
 * moment something goes wrong.
 */
export function handleApiError(error: unknown) {
  const t = createTranslator(getDictionary(getLocale()));

  if (error instanceof ValidationError) {
    const message = t(error.messageKey, error.messageParams);
    return createErrorResponse(translateDetails(error.details, t) ?? error.code, message, error.status);
  }
  if (error instanceof TooManyRequestsError) {
    // The standard header telling the client when it may retry.
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
