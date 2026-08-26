/**
 * @file FollowService.ts
 * @description Business rules for following and unfollowing, and the
 * follower/following lists.
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
      throw new NotFoundError("errors.userNotFound");
    }
  }

  /** followerId follows targetId. You cannot follow yourself, and the target must exist. */
  async follow(followerId: string, targetId: string): Promise<void> {
    this.assertValidId(targetId);
    if (followerId === targetId) {
      throw new ValidationError("errors.cannotFollowSelf");
    }

    const target = await userRepository.findById(targetId);
    if (!target) throw new NotFoundError("errors.userNotFound");

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

    // Unfollowing removes the notification too; following again produces a new one
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
