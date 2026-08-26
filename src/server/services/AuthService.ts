/**
 * @file AuthService.ts
 * @description Business rules for registration and sign-in. Password hashing
 * (bcrypt) happens here; tokens and cookies belong to the route layer, being an
 * HTTP detail.
 */

import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/UserRepository";
import { RegisterSchema, LoginSchema } from "../validations/user.schema";
import { ConflictError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { toUserDTO, type UserDTO } from "@/lib/types/dto";

const BCRYPT_ROUNDS = 12;

export class AuthService {
  /**
   * Registers a new user.
   *
   * If a CLOSED account exists for that email, no new row is created; that
   * account is reopened with the new password and its tasting notes, comments
   * and follows come back. Closing was always a soft delete, so the data had
   * never gone — only the way back was missing.
   *
   * The cost is plain: with no email verification, anyone who knows the address
   * of a closed account can take this path and inherit its history. Accepted
   * knowingly as a product decision. Privilege is not inherited in exchange —
   * the repository drops a reopened account to the "user" role.
   */
  async register(data: unknown): Promise<UserDTO> {
    const parsed = RegisterSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("errors.invalidRegistration", parsed.error.flatten().fieldErrors);
    }

    const { name, email, password } = parsed.data;

    // Only OPEN accounts occupy an address; a closed one is about to be reopened.
    if (await userRepository.existsByEmail(email)) {
      throw new ConflictError("errors.emailTaken");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const closed = await userRepository.findClosedByEmail(email);
    if (closed) {
      const reopened = await userRepository.reopen(String(closed._id), { name, passwordHash });
      // If the row vanished between the two queries (a race), fall through to
      // the normal registration path.
      if (reopened) return toUserDTO(reopened);
    }

    // The first user in the system automatically becomes an administrator
    // (bootstrap). Later admins are appointed by an existing one. Reopening
    // does not pass through here: that is not a new registration.
    const isFirstUser = (await userRepository.count()) === 0;

    const user = await userRepository.create({
      name,
      email,
      passwordHash,
      role: isFirstUser ? "admin" : "user",
    });

    return toUserDTO(user);
  }

  /** Sign-in — a wrong email and a wrong password are indistinguishable (enumeration guard). */
  async login(data: unknown): Promise<UserDTO> {
    const parsed = LoginSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("errors.invalidLoginData", parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("errors.invalidCredentials");
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError("errors.invalidCredentials");
    }

    return toUserDTO(user);
  }
}

export const authService = new AuthService();
