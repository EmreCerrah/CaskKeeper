/**
 * @file admin.ts
 * @description Veritabanı doğrulamalı yönetici kontrolü.
 *
 * session.ts'teki requireAdmin rolü JWT'den okur ve edge-safe'tir (middleware
 * onu kullanır). Ancak token 7 gün geçerli olduğundan, yetkisi kaldırılan bir
 * kullanıcı eski token'ıyla yönetici gibi davranmaya devam edebilir.
 * Yetki gerektiren tüm işlemler bu modüldeki kontrolü kullanır — rol her
 * istekte veritabanından doğrulanır. Bu dosya mongoose'a bağımlı olduğu için
 * middleware'den ASLA import edilmemelidir.
 */

import { requireSession, type SessionPayload } from "./session";
import { userRepository } from "@/server/repositories/UserRepository";
import { ForbiddenError } from "@/lib/errors";

/**
 * Oturum sahibinin veritabanındaki rolünü doğrular.
 * Oturum yoksa 401, güncel rolü admin değilse 403 fırlatır.
 */
export async function requireAdminUser(): Promise<SessionPayload> {
  const session = await requireSession();

  const user = await userRepository.findById(session.userId);
  if (!user || user.role !== "admin") {
    throw new ForbiddenError("errors.adminRequired");
  }

  return session;
}

/** Yetki durumunu hata fırlatmadan döndürür (arayüzde koşullu gösterim için). */
export async function isCurrentUserAdmin(userId: string): Promise<boolean> {
  const user = await userRepository.findById(userId);
  return user?.role === "admin";
}
