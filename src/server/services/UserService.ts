/**
 * @file UserService.ts
 * @description Kullanıcı profili iş mantığı.
 */

import mongoose from "mongoose";
import { userRepository } from "../repositories/UserRepository";
import { followRepository } from "../repositories/FollowRepository";
import { tastingNoteRepository } from "../repositories/TastingNoteRepository";
import { UpdateProfileSchema } from "../validations/user.schema";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  toUserDTO,
  type UserDTO,
  type PublicProfileDTO,
  type UserSearchResultDTO,
} from "@/lib/types/dto";
import type { IUser } from "../models/User";

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

    const canHaveRelation = Boolean(viewerId) && !isOwnProfile;

    const [followerCount, followingCount, publicNoteCount, isFollowedByViewer, isFollowingViewer] =
      await Promise.all([
        followRepository.countFollowers(userId),
        followRepository.countFollowing(userId),
        tastingNoteRepository.countPublicByUser(userId),
        canHaveRelation ? followRepository.exists(viewerId!, userId) : Promise.resolve(false),
        canHaveRelation ? followRepository.exists(userId, viewerId!) : Promise.resolve(false),
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
      isFollowingViewer,
      isMutual: isFollowedByViewer && isFollowingViewer,
      isOwnProfile,
    };
  }

  // ---------- Keşfet / Arama ----------

  /**
   * İsme göre kullanıcı arar. Arama boşsa keşfet listesi (en yeni üyeler)
   * döner. Takip ilişkileri ve not sayıları toplu sorgularla çözülür.
   *
   * @param viewerId Giriş yapmış kullanıcı — kendisi sonuçlara dahil edilmez
   */
  async searchUsers(query: string, viewerId?: string, limit = 20): Promise<UserSearchResultDTO[]> {
    const trimmed = query.trim();

    const users = trimmed
      ? await userRepository.searchByName(trimmed, limit, viewerId)
      : await userRepository.findRecent(limit, viewerId ? [viewerId] : []);

    return await this.decorateUsers(users, viewerId);
  }

  /** Kullanıcı listesine takip ilişkisi ve not sayısı bilgisini ekler. */
  private async decorateUsers(users: IUser[], viewerId?: string): Promise<UserSearchResultDTO[]> {
    if (users.length === 0) return [];

    const ids = users.map((u) => String(u._id));

    const [noteCounts, relations] = await Promise.all([
      tastingNoteRepository.countPublicByUsers(ids),
      viewerId
        ? followRepository.getRelationSets(viewerId)
        : Promise.resolve({ following: new Set<string>(), followers: new Set<string>() }),
    ]);

    return users.map((user) => {
      const id = String(user._id);
      const isFollowedByViewer = relations.following.has(id);
      const isFollowingViewer = relations.followers.has(id);

      return {
        id,
        name: user.name,
        profilePicture: user.profilePicture ?? undefined,
        bio: user.bio ?? undefined,
        publicNoteCount: noteCounts.get(id) ?? 0,
        isFollowedByViewer,
        isFollowingViewer,
        isMutual: isFollowedByViewer && isFollowingViewer,
      };
    });
  }

  // ---------- Yönetim ----------

  /** Yönetim panelindeki kullanıcı listesi */
  async listUsers(): Promise<UserDTO[]> {
    const users = await userRepository.findAll();
    return users.map(toUserDTO);
  }

  /**
   * Bir kullanıcının rolünü değiştirir (yalnızca admin çağırmalı).
   * İki koruma: yönetici kendi rolünü düşüremez ve sistemdeki son admin
   * yetkisini kaybedemez — aksi halde kimse yönetime erişemez.
   */
  async setRole(actorId: string, targetId: string, role: "user" | "admin"): Promise<UserDTO> {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      throw new NotFoundError("Kullanıcı bulunamadı");
    }

    const target = await userRepository.findById(targetId);
    if (!target) throw new NotFoundError("Kullanıcı bulunamadı");

    if (actorId === targetId && role === "user") {
      throw new ForbiddenError("Kendi yönetici yetkinizi kaldıramazsınız");
    }

    if (target.role === "admin" && role === "user") {
      const adminCount = await userRepository.countAdmins();
      if (adminCount <= 1) {
        throw new ForbiddenError("Sistemdeki son yöneticinin yetkisi kaldırılamaz");
      }
    }

    const updated = await userRepository.updateRole(targetId, role);
    if (!updated) throw new NotFoundError("Kullanıcı bulunamadı");
    return toUserDTO(updated);
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
