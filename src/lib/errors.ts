/**
 * @file errors.ts
 * @description Uygulama genelinde kullanılan tipli hata sınıfları.
 * Service katmanı bu hataları fırlatır; API route'lar handleApiError ile
 * tutarlı HTTP yanıtlarına dönüştürür.
 *
 * Mesaj YERİNE ÇEVİRİ ANAHTARI taşınır. Sebebi: iş kuralı katmanı isteğin
 * dilini bilmez ve bilmemeli — dil bir HTTP meselesidir, handleApiError'da
 * çözülür (bkz. api-response.ts). Anahtarın tipi sözlükten türediği için
 * serbest metin fırlatmak DERLEME HATASI verir; arayüz İngilizceyken sunucudan
 * Türkçe cümle dönmesi böylece bir daha mümkün olmaz.
 *
 * `import type` bilinçli: sözlük runtime'a girmez, bu yüzden bu modülü kullanan
 * session.ts Edge runtime'da (middleware) çalışmaya devam eder.
 */

import type { TranslationKey } from "@/lib/i18n/translate";

/** `{slug}` gibi yer tutucuların değerleri — çeviri sırasında yerleştirilir. */
export type MessageParams = Record<string, string | number>;

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly messageKey: TranslationKey;
  readonly messageParams?: MessageParams;

  constructor(
    messageKey: TranslationKey,
    status = 500,
    code = "INTERNAL_ERROR",
    messageParams?: MessageParams
  ) {
    // Error.message anahtarın kendisini taşır: log ve stack trace'te hangi
    // hatanın fırlatıldığı, çeviriye bakmadan okunabilir kalır.
    super(messageKey);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.messageKey = messageKey;
    this.messageParams = messageParams;
  }
}

export class ValidationError extends AppError {
  readonly details?: unknown;

  constructor(messageKey: TranslationKey = "errors.invalidData", details?: unknown, messageParams?: MessageParams) {
    super(messageKey, 400, "VALIDATION_ERROR", messageParams);
    this.name = "ValidationError";
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(messageKey: TranslationKey = "errors.loginRequired", messageParams?: MessageParams) {
    super(messageKey, 401, "UNAUTHORIZED", messageParams);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(messageKey: TranslationKey = "errors.forbidden", messageParams?: MessageParams) {
    super(messageKey, 403, "FORBIDDEN", messageParams);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(messageKey: TranslationKey = "errors.notFound", messageParams?: MessageParams) {
    super(messageKey, 404, "NOT_FOUND", messageParams);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(messageKey: TranslationKey = "errors.conflict", messageParams?: MessageParams) {
    super(messageKey, 409, "CONFLICT", messageParams);
    this.name = "ConflictError";
  }
}

export class TooManyRequestsError extends AppError {
  /** İstemcinin kaç saniye sonra tekrar deneyebileceği — Retry-After başlığına yazılır. */
  readonly retryAfterSeconds: number;

  constructor(
    messageKey: TranslationKey = "errors.tooManyAttempts",
    retryAfterSeconds = 60,
    messageParams?: MessageParams
  ) {
    super(messageKey, 429, "TOO_MANY_REQUESTS", messageParams);
    this.name = "TooManyRequestsError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
