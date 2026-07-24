/**
 * @file UserService.ts
 * @description Kullanıcı profili iş mantığı.
 */

import { userRepository } from "../repositories/UserRepository";
import { UpdateProfileSchema } from "../validations/user.schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { toUserDTO, type UserDTO } from "@/lib/types/dto";

export class UserService {
  async getById(id: string): Promise<UserDTO> {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("Kullanıcı bulunamadı");
    return toUserDTO(user);
  }

  async updateProfile(userId: string, data: unknown): Promise<UserDTO> {
    const parsed = UpdateProfileSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Geçersiz profil bilgileri", parsed.error.flatten().fieldErrors);
    }

    // Boş string'leri alanı temizleme talebi olarak yorumla
    const { name, bio, profilePicture } = parsed.data;
    const update: Record<string, string | undefined> = {};
    if (name !== undefined) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (profilePicture !== undefined) update.profilePicture = profilePicture;

    const updated = await userRepository.update(userId, update);
    if (!updated) throw new NotFoundError("Kullanıcı bulunamadı");
    return toUserDTO(updated);
  }
}

export const userService = new UserService();
