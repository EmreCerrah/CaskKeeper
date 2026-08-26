/**
 * @file UserService.ts
 * @description Business rules for user profiles.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/UserRepository";
import { followRepository } from "../repositories/FollowRepository";
import { tastingNoteRepository } from "../repositories/TastingNoteRepository";
import { notificationRepository } from "../repositories/NotificationRepository";
import { UpdateProfileSchema } from "../validations/user.schema";
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";
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
    if (!user) throw new NotFoundError("errors.userNotFound");
    return toUserDTO(user);
  }

  /**
   * Assembles the public profile data.
   * @param userId    Whose profile is being viewed
   * @param viewerId  Who is asking (undefined when signed out)
   */
  async getPublicProfile(userId: string, viewerId?: string): Promise<PublicProfileDTO> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError("errors.userNotFound");
    }

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("errors.userNotFound");

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

  // ---------- Discovery / Search ----------

  /**
   * Searches users by name. With an empty search it returns the discovery list
   * (the newest members). Follow relationships and note counts are resolved in
   * batched queries.
   *
   * @param viewerId The signed-in user — they are left out of their own results
   */
  async searchUsers(query: string, viewerId?: string, limit = 20): Promise<UserSearchResultDTO[]> {
    const trimmed = query.trim();

    const users = trimmed
      ? await userRepository.searchByName(trimmed, limit, viewerId)
      : await userRepository.findRecent(limit, viewerId ? [viewerId] : []);

    return await this.decorateUsers(users, viewerId);
  }

  /** Adds follow relationships and note counts to a list of users. */
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

  // ---------- Administration ----------

  /** The user list in the admin panel. */
  async listUsers(): Promise<UserDTO[]> {
    const users = await userRepository.findAll();
    return users.map(toUserDTO);
  }

  /**
   * Changes a user's role (only an admin should call this).
   * Two guards: an administrator cannot demote themselves, and the last admin
   * in the system cannot lose the role — otherwise nobody could reach the admin
   * area again.
   */
  async setRole(actorId: string, targetId: string, role: "user" | "admin"): Promise<UserDTO> {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      throw new NotFoundError("errors.userNotFound");
    }

    const target = await userRepository.findById(targetId);
    if (!target) throw new NotFoundError("errors.userNotFound");

    if (actorId === targetId && role === "user") {
      throw new ForbiddenError("errors.cannotDemoteSelf");
    }

    if (target.role === "admin" && role === "user") {
      const adminCount = await userRepository.countAdmins();
      if (adminCount <= 1) {
        throw new ForbiddenError("errors.cannotDemoteLastAdmin");
      }
    }

    const updated = await userRepository.updateRole(targetId, role);
    if (!updated) throw new NotFoundError("errors.userNotFound");
    return toUserDTO(updated);
  }

  async updateProfile(userId: string, data: unknown): Promise<UserDTO> {
    const parsed = UpdateProfileSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("errors.invalidProfile", parsed.error.flatten().fieldErrors);
    }

    // Treat empty strings as a request to clear the field
    const { name, bio, profilePicture } = parsed.data;
    const update: Record<string, string | undefined> = {};
    if (name !== undefined) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (profilePicture !== undefined) update.profilePicture = profilePicture;

    const updated = await userRepository.update(userId, update);
    if (!updated) throw new NotFoundError("errors.userNotFound");
    return toUserDTO(updated);
  }

  /**
   * Closes the account.
   *
   * Records are not deleted, they leave visibility (see the active filter in
   * UserRepository): tasting notes and comments hang off other people's data,
   * so really deleting them would damage that content. Notifications are the
   * one exception — they are derived data and are deleted (see
   * notificationRepository.deleteByUser).
   *
   * REVERSIBLE: registering again with the same email reopens this account
   * with a new password and brings its history back (AuthService.register).
   * The deleted notifications do not come back.
   */
  async closeAccount(userId: string, password: unknown): Promise<void> {
    if (typeof password !== "string" || password.length === 0) {
      throw new ValidationError("errors.passwordRequiredToClose");
    }

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user || !user.passwordHash) throw new NotFoundError("errors.userNotFound");

    // Password check: stops an account being closed from an unlocked device.
    // Closing is reversible now, but somebody being able to close another
    // person's account behind their back still is not acceptable.
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError("errors.invalidCredentials");
    }

    // The twin of the "the last administrator cannot be demoted" rule: nobody
    // should be able to leave the system without an admin by closing their own
    // account either.
    if (user.role === "admin" && (await userRepository.countAdmins()) <= 1) {
      throw new ForbiddenError("errors.cannotCloseLastAdmin");
    }

    const closed = await userRepository.close(userId);
    if (!closed) throw new NotFoundError("errors.userNotFound");

    await notificationRepository.deleteByUser(userId);
  }
}

export const userService = new UserService();
