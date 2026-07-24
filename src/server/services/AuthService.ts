/**
 * @file AuthService.ts
 * @description Kayıt ve giriş iş mantığı. Parola hash'leme (bcrypt) burada yapılır;
 * token/cookie yönetimi route katmanının sorumluluğundadır (HTTP detayı).
 */

import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/UserRepository";
import { RegisterSchema, LoginSchema } from "../validations/user.schema";
import { ConflictError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { toUserDTO, type UserDTO } from "@/lib/types/dto";

const BCRYPT_ROUNDS = 12;

export class AuthService {
  /** Yeni kullanıcı kaydı — e-posta benzersizliği kontrol edilir. */
  async register(data: unknown): Promise<UserDTO> {
    const parsed = RegisterSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Geçersiz kayıt bilgileri", parsed.error.flatten().fieldErrors);
    }

    const { name, email, password } = parsed.data;

    if (await userRepository.existsByEmail(email)) {
      throw new ConflictError("Bu e-posta adresi ile kayıtlı bir hesap zaten var");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await userRepository.create({ name, email, passwordHash });

    return toUserDTO(user);
  }

  /** Giriş — hatalı e-posta/parola ayrımı yapılmaz (enumeration koruması). */
  async login(data: unknown): Promise<UserDTO> {
    const parsed = LoginSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Geçersiz giriş bilgileri", parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("E-posta veya parola hatalı");
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError("E-posta veya parola hatalı");
    }

    return toUserDTO(user);
  }
}

export const authService = new AuthService();
