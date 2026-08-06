/**
 * @file session.ts
 * @description JWT tabanlı oturum yönetimi (jose + httpOnly cookie).
 * Edge runtime uyumludur — middleware.ts de bu modülü kullanır.
 * Oturum verisi minimal tutulur (id, name, email, role); profil detayı
 * her zaman veritabanından okunur.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
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
    throw new Error("JWT_SECRET ortam değişkeni tanımlı değil");
  }
  return new TextEncoder().encode(secret);
}

/** Oturum token'ı üretir (HS256, 7 gün geçerli). */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getSecretKey());
}

/** Token'ı doğrular; geçersiz/süresi dolmuşsa null döner. */
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

/** Server component / route handler içinden aktif oturumu okur. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

/** Korumalı route handler'lar için: oturum yoksa UnauthorizedError fırlatır. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

/**
 * Yönetici işlemleri için: oturum yoksa 401, admin değilse 403 fırlatır.
 * Rol oturum token'ından okunur; rol değişiminde token tazelenir.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "admin") {
    throw new ForbiddenError("errors.adminRequired");
  }
  return session;
}

/** Oturum cookie'sini yazar (login/register sonrası). */
export function setSessionCookie(token: string): void {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });
}

/** Oturum cookie'sini siler (logout). */
export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
