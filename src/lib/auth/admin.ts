/**
 * @file admin.ts
 * @description The administrator check, verified against the database.
 *
 * requireAdmin in session.ts reads the role from the JWT and is edge-safe
 * (middleware uses it). But a token is valid for seven days, so a user whose
 * privilege was removed could keep acting as an administrator with their old
 * one. Every privileged operation uses the check in this module instead, where
 * the role is verified against the database on each request. This file depends
 * on mongoose and must NEVER be imported from middleware.
 */

import { requireSession, type SessionPayload } from "./session";
import { userRepository } from "@/server/repositories/UserRepository";
import { ForbiddenError } from "@/lib/errors";

/**
 * Verifies the session holder's role against the database.
 * Throws 401 without a session, and 403 when their current role is not admin.
 */
export async function requireAdminUser(): Promise<SessionPayload> {
  const session = await requireSession();

  const user = await userRepository.findById(session.userId);
  if (!user || user.role !== "admin") {
    throw new ForbiddenError("errors.adminRequired");
  }

  return session;
}

/** Returns the privilege state without throwing (for conditional rendering in the UI). */
export async function isCurrentUserAdmin(userId: string): Promise<boolean> {
  const user = await userRepository.findById(userId);
  return user?.role === "admin";
}
