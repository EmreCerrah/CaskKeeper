import { acceptLanguageHeader, deviceLocale, t } from "../i18n";
import { ApiError, unwrapApiResponse } from "./response";

/**
 * @file client.ts
 * @description The single door to the API.
 *
 * It adds three things to every request: the base URL, the session token and
 * the device language. The last one matters — the server returns error
 * messages in the language of the request (PR #24), so error text never has to
 * be translated here.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  // Quietly falling back to localhost would be the worst outcome: on a phone
  // "localhost" is the phone itself, the request never leaves, and the reason
  // is impossible to guess.
  throw new Error("EXPO_PUBLIC_API_URL is not set — check mobile/.env.");
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Session token; without it the request goes out anonymously. */
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
    // The server was never reached, so there is no server message to show and
    // the text is produced on the client. This is the only such place.
    throw new ApiError(t("error.network"), 0);
  }

  const payload = await response.json().catch(() => null);
  return unwrapApiResponse<T>(response.status, payload, t("error.unexpected"));
}

export { ApiError };
