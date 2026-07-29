/**
 * @file FollowService.ts
 * @description Takip etme/bırakma iş mantığı ve takipçi/takip listeleri.
 */

import { followRepository } from "../repositories/FollowRepository";
import { userRepository } from "../repositories/UserRepository";
import { notificationService } from "./NotificationService";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { toPublicUserDTO, type PublicUserDTO } from "@/lib/types/dto";
import mongoose from "mongoose";

export class FollowService {
  private assertValidId(id: string): void {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError("Kullanıcı bulunamadı");
    }
  }

  /** followerId, targetId'yi takip eder. Kendini takip edemez; hedef var olmalı. */
  async follow(followerId: string, targetId: string): Promise<void> {
    this.assertValidId(targetId);
    if (followerId === targetId) {
      throw new ValidationError("Kendinizi takip edemezsiniz");
    }

    const target = await userRepository.findById(targetId);
    if (!target) throw new NotFoundError("Kullanıcı bulunamadı");

    await followRepository.create(followerId, targetId);

    await notificationService.notify({
      recipientId: targetId,
      actorId: followerId,
      type: "follow",
    });
  }

  async unfollow(followerId: string, targetId: string): Promise<void> {
    this.assertValidId(targetId);
    await followRepository.delete(followerId, targetId);

    // Takip bırakıldığında bildirim de kalkar; tekrar takipte yenisi üretilir
    await notificationService.revoke({
      recipientId: targetId,
      actorId: followerId,
      type: "follow",
    });
  }

  async isFollowing(followerId: string, targetId: string): Promise<boolean> {
    return await followRepository.exists(followerId, targetId);
  }

  async getFollowers(userId: string): Promise<PublicUserDTO[]> {
    this.assertValidId(userId);
    const users = await followRepository.getFollowers(userId);
    return users.map(toPublicUserDTO);
  }

  async getFollowing(userId: string): Promise<PublicUserDTO[]> {
    this.assertValidId(userId);
    const users = await followRepository.getFollowing(userId);
    return users.map(toPublicUserDTO);
  }
}

export const followService = new FollowService();
