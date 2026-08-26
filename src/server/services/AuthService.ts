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
  /**
   * Yeni kullanıcı kaydı.
   *
   * Aynı e-postayla KAPALI bir hesap varsa yeni satır açılmaz; o hesap yeni
   * parolayla canlandırılır ve tadım notları, yorumları, takipleri geri gelir.
   * Hesap kapatma zaten soft delete olduğu için veriler hep duruyordu, geri
   * dönüş yolu yoktu.
   *
   * Bunun bedeli açık: e-posta doğrulaması olmadığı için, kapalı bir hesabın
   * adresini bilen herkes bu yoldan geçip o hesabın geçmişini devralabilir.
   * Ürün kararı olarak bilerek kabul edildi. Karşılığında yetki devralınmıyor
   * — canlanan hesabın rolünü repository "user"a düşürüyor.
   */
  async register(data: unknown): Promise<UserDTO> {
    const parsed = RegisterSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("errors.invalidRegistration", parsed.error.flatten().fieldErrors);
    }

    const { name, email, password } = parsed.data;

    // Yalnızca AÇIK hesaplar adresi meşgul eder; kapalı olan canlandırılacak.
    if (await userRepository.existsByEmail(email)) {
      throw new ConflictError("errors.emailTaken");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const closed = await userRepository.findClosedByEmail(email);
    if (closed) {
      const reopened = await userRepository.reopen(String(closed._id), { name, passwordHash });
      // Satır iki sorgu arasında yok olduysa (yarış) normal kayda düşülür.
      if (reopened) return toUserDTO(reopened);
    }

    // Sistemdeki ilk kullanıcı otomatik olarak yönetici olur (bootstrap).
    // Sonraki adminler mevcut bir admin tarafından atanır. Canlandırma bu
    // yoldan geçmiyor: orası yeni bir kayıt değil.
    const isFirstUser = (await userRepository.count()) === 0;

    const user = await userRepository.create({
      name,
      email,
      passwordHash,
      role: isFirstUser ? "admin" : "user",
    });

    return toUserDTO(user);
  }

  /** Giriş — hatalı e-posta/parola ayrımı yapılmaz (enumeration koruması). */
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
