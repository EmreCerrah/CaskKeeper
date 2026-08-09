/**
 * @file response.ts
 * @description Sunucu yanıtının çözümlenmesi — SAF kısım.
 *
 * API'nin tek bir zarfı var: `{ success, message?, data?, error? }`. Bu dosya
 * zarfı açar ve başarısızlıkta hata fırlatır. fetch'ten ayrı tutuluyor ki
 * ağ olmadan test edilebilsin.
 *
 * Hata METİNLERİ burada üretilmez: sunucu mesajı isteğin dilinde döndürüyor
 * (PR #24), istemci onu olduğu gibi gösteriyor. Tek istisna, sunucuya hiç
 * ulaşılamadığı durum — o zaman gösterilecek bir sunucu mesajı da yoktur.
 */

/** Sunucunun döndürdüğü zarf. */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  /** VALIDATION_ERROR, UNAUTHORIZED gibi sabit kod — metin değil, karar için. */
  readonly code?: string;
  /** Doğrulama hatalarında alan bazlı mesajlar; sunucu bunları da çeviriyor. */
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  /** Oturum düşmüş mü — çağıran token'ı silmeli. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/**
 * `error` alanı iki şekilde geliyor: doğrulama hatasında alan→mesaj sözlüğü,
 * diğer hatalarda sabit bir kod dizesi. İkisini ayırır.
 */
function splitError(error: unknown): { code?: string; fieldErrors?: Record<string, string[]> } {
  if (typeof error === "string") return { code: error };

  if (error && typeof error === "object" && !Array.isArray(error)) {
    return { fieldErrors: error as Record<string, string[]> };
  }

  return {};
}

/**
 * Zarfı açar: başarılıysa `data`, değilse ApiError.
 *
 * `fallbackMessage` yalnızca sunucu mesaj göndermediğinde kullanılır — bu
 * beklenmez, ama boş bir hata kutusu göstermekten iyidir.
 */
export function unwrapApiResponse<T>(status: number, body: unknown, fallbackMessage: string): T {
  const envelope = (body ?? {}) as ApiEnvelope<T>;

  if (status >= 200 && status < 300 && envelope.success) {
    return envelope.data as T;
  }

  const { code, fieldErrors } = splitError(envelope.error);
  throw new ApiError(envelope.message || fallbackMessage, status, code, fieldErrors);
}
