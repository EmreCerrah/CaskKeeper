import { NextResponse } from "next/server";
import { AppError, TooManyRequestsError, ValidationError } from "@/lib/errors";

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

export function createErrorResponse(error: unknown, message: string = "Bir hata oluştu", status: number = 500) {
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
 * Service katmanından fırlatılan tipli hataları tutarlı HTTP yanıtlarına çevirir.
 * Bilinmeyen hatalar 500 olarak döner; iç detaylar istemciye sızdırılmaz.
 */
export function handleApiError(error: unknown) {
  if (error instanceof ValidationError) {
    return createErrorResponse(error.details ?? error.code, error.message, error.status);
  }
  if (error instanceof TooManyRequestsError) {
    // İstemcinin ne zaman tekrar deneyebileceğini bilmesi için standart başlık.
    const response = createErrorResponse(error.code, error.message, error.status);
    response.headers.set("Retry-After", String(error.retryAfterSeconds));
    return response;
  }
  if (error instanceof AppError) {
    return createErrorResponse(error.code, error.message, error.status);
  }
  console.error("[api] Beklenmeyen hata:", error);
  return createErrorResponse("INTERNAL_ERROR", "Beklenmeyen bir hata oluştu", 500);
}
