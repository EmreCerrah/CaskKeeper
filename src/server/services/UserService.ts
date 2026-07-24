/**
 * @file UserService.ts
 * @description Kullanıcı profili iş mantığı.
 */

import mongoose from "mongoose";
import { userRepository } from "../repositories/UserRepository";
import { followRepository } from "../repositories/FollowRepository";
import { tastingNoteRepository } from "../repositories/TastingNoteRepository";
import { UpdateProfileSchema } from "../validations/user.schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { toUserDTO, type UserDTO, type PublicProfileDTO } from "@/lib/types/dto";

export class UserService {
  async getById(id: string): Promise<UserDTO> {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("Kullanıcı bulunamadı");
    return toUserDTO(user);
  }

  /**
   * Herkese açık profil verisini derler.
   * @param userId    Görüntülenen profilin sahibi
   * @param viewerId  İsteği yapan kullanıcı (giriş yapmamışsa undefined)
   */
  async getPublicProfile(userId: string, viewerId?: string): Promise<PublicProfileDTO> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError("Kullanıcı bulunamadı");
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Kullanıcı bulunamadı");

    const isOwnProfile = viewerId === userId;

    const [followerCount, followingCount, publicNoteCount, isFollowedByViewer] = await Promise.all([
      followRepository.countFollowers(userId),
      followRepository.countFollowing(userId),
      tastingNoteRepository.countPublicByUser(userId),
      viewerId && !isOwnProfile ? followRepository.exists(viewerId, userId) : Promise.resolve(false),
    ]);

    return {
      id: String(user._id),
      name: user.name,
      profilePicture: user.profilePicture ?? undefined,
      bio: user.bio ?? undefined,
      createdAt: new Date(user.createdAt).toISOString(),
      followerCount,
      followingCount,
      publicNoteCount,
      isFollowedByViewer,
      isOwnProfile,
    };
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
