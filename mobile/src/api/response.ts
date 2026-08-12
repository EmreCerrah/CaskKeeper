/**
 * @file response.ts
 * @description Parsing the server's response — the PURE part.
 *
 * The API has a single envelope: `{ success, message?, data?, error? }`. This
 * file opens it and throws on failure. It is kept apart from fetch so it can
 * be tested without a network.
 *
 * Error TEXT is never produced here: the server returns the message in the
 * language of the request (PR #24) and the client shows it as-is. The one
 * exception is failing to reach the server at all — then there is no server
 * message to show.
 */

/** The envelope the server returns. */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  /** A stable code like VALIDATION_ERROR or UNAUTHORIZED — for branching, not display. */
  readonly code?: string;
  /** Per-field messages on validation errors; the server translates these too. */
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  /** Has the session lapsed — the caller should delete the token. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/**
 * The `error` field arrives in two shapes: a field→messages map on validation
 * errors, a stable code string otherwise. This tells them apart.
 */
function splitError(error: unknown): { code?: string; fieldErrors?: Record<string, string[]> } {
  if (typeof error === "string") return { code: error };

  if (error && typeof error === "object" && !Array.isArray(error)) {
    return { fieldErrors: error as Record<string, string[]> };
  }

  return {};
}

/**
 * Opens the envelope: `data` on success, an ApiError otherwise.
 *
 * `fallbackMessage` is used only when the server sends no message — which is
 * not expected, but beats showing an empty error box.
 */
export function unwrapApiResponse<T>(status: number, body: unknown, fallbackMessage: string): T {
  const envelope = (body ?? {}) as ApiEnvelope<T>;

  if (status >= 200 && status < 300 && envelope.success) {
    return envelope.data as T;
  }

  const { code, fieldErrors } = splitError(envelope.error);
  throw new ApiError(envelope.message || fallbackMessage, status, code, fieldErrors);
}
