/**
 * @file errors.ts
 * @description The typed error classes used across the application.
 * The service layer throws them; API routes turn them into consistent HTTP
 * responses through handleApiError.
 *
 * They carry a TRANSLATION KEY rather than a message. The reason: the
 * business-rules layer does not know the language of the request, and should
 * not — language is an HTTP concern, resolved in handleApiError (see
 * api-response.ts). The key's type is derived from the dictionary, so throwing
 * free text is a COMPILE ERROR; a Turkish sentence can never again come back
 * from the server while the interface is in English.
 *
 * The `import type` is deliberate: the dictionary never enters the runtime, so
 * session.ts — which uses this module — keeps working in the Edge runtime
 * (middleware).
 */

import type { TranslationKey } from "@/lib/i18n/translate";

/** The values for placeholders like `{slug}` — filled in during translation. */
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
    // Error.message carries the key itself: in a log or a stack trace, which
    // error was thrown stays readable without consulting the dictionary.
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
  /** How many seconds until the client may retry — written to the Retry-After header. */
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
