/**
 * @file session.ts
 * @description JWT-based session handling (jose + an httpOnly cookie).
 * Edge-runtime compatible — middleware.ts uses this module too.
 * The session payload is kept minimal (id, name, email, role); profile detail
 * is always read from the database.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

export const SESSION_COOKIE = "caskkeeper_session";
const SESSION_DURATION_DAYS = 7;

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("The JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

/** Issues a session token (HS256, valid for seven days). */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getSecretKey());
}

/** Verifies a token; returns null when it is invalid or expired. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

/**
 * Extracts the token from an `Authorization: Bearer <token>` header.
 *
 * A separate function because getSession() depends on next/headers and is
 * expensive to set up in a unit test, while the parsing itself should be pure
 * and testable. The scheme name is case-insensitive (RFC 7235).
 */
export function extractBearerToken(headerValue: string | null | undefined): string | null {
  if (!headerValue) return null;

  const match = /^\s*Bearer\s+(\S+)\s*$/i.exec(headerValue);
  return match ? match[1] : null;
}

/**
 * Reads the active session from inside a server component or route handler.
 *
 * Two carriers are supported: a browser uses the httpOnly cookie, a native
 * client (the mobile app) uses `Authorization: Bearer` — cookies are not a
 * concept there, and the token lives in the device's secure store.
 *
 * The cookie is tried first: the overwhelming majority of web requests arrive
 * that way, and reading the header would be wasted work.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const token =
    cookies().get(SESSION_COOKIE)?.value ?? extractBearerToken(headers().get("authorization"));

  if (!token) return null;
  return await verifySessionToken(token);
}

/** For protected route handlers: throws UnauthorizedError when there is no session. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

/**
 * For administrative operations: 401 without a session, 403 without the admin
 * role. The role is read from the session token, which is refreshed when a role
 * changes.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "admin") {
    throw new ForbiddenError("errors.adminRequired");
  }
  return session;
}

/** Writes the session cookie (after sign-in or registration). */
export function setSessionCookie(token: string): void {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });
}

/** Deletes the session cookie (sign-out). */
export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
