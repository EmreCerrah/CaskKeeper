/**
 * @file errors.ts
 * @description Uygulama genelinde kullanılan tipli hata sınıfları.
 * Service katmanı bu hataları fırlatır; API route'lar handleApiError ile
 * tutarlı HTTP yanıtlarına dönüştürür.
 */

export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  readonly details?: unknown;

  constructor(message = "Geçersiz veri", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Bu işlem için giriş yapmalısınız") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Bu işlem için yetkiniz yok") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Kayıt bulunamadı") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Bu kayıt zaten mevcut") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}
