/**
 * @file FollowRepository.ts
 * @description The MongoDB access layer for follow relationships.
 */

import mongoose from "mongoose";
import Follow, { IFollow } from "../models/Follow";
import User, { IUser } from "../models/User";
import { userRepository } from "./UserRepository";

export class FollowRepository {
  /** Creates a follow. Idempotent if it already exists (an upsert). */
  async create(followerId: string, followingId: string): Promise<void> {
    await Follow.updateOne(
      { follower: followerId, following: followingId },
      { $setOnInsert: { follower: followerId, following: followingId } },
      { upsert: true }
    );
  }

  /** Removes a follow. Returns true when a record was actually deleted. */
  async delete(followerId: string, followingId: string): Promise<boolean> {
    const result = await Follow.deleteOne({ follower: followerId, following: followingId });
    return result.deletedCount > 0;
  }

  async exists(followerId: string, followingId: string): Promise<boolean> {
    return !!(await Follow.exists({ follower: followerId, following: followingId }));
  }

  /**
   * Follower count — only OPEN accounts are counted.
   *
   * Counting the follow rows was not enough: a closed account would keep
   * showing up in the number while being absent from the list. Two light
   * queries; no aggregation needed.
   */
  async countFollowers(userId: string): Promise<number> {
    return await userRepository.countActiveByIds(await this.getFollowerIds(userId));
  }

  async countFollowing(userId: string): Promise<number> {
    return await userRepository.countActiveByIds(await this.getFollowingIds(userId));
  }

  /** For the feed: the ids of the people this user follows. */
  async getFollowingIds(userId: string): Promise<mongoose.Types.ObjectId[]> {
    const docs = await Follow.find({ follower: userId }).select("following").lean();
    return (docs as Pick<IFollow, "following">[]).map((d) => d.following);
  }

  /** The ids of the people who follow this user. */
  async getFollowerIds(userId: string): Promise<mongoose.Types.ObjectId[]> {
    const docs = await Follow.find({ following: userId }).select("follower").lean();
    return (docs as Pick<IFollow, "follower">[]).map((d) => d.follower);
  }

  /**
   * Returns a user's following and follower relationships as sets, in one
   * pass. It exists so search results do not fire a query per row (avoiding
   * N+1).
   */
  async getRelationSets(userId: string): Promise<{ following: Set<string>; followers: Set<string> }> {
    const [followingIds, followerIds] = await Promise.all([
      this.getFollowingIds(userId),
      this.getFollowerIds(userId),
    ]);

    return {
      following: new Set(followingIds.map(String)),
      followers: new Set(followerIds.map(String)),
    };
  }

  /** The people following a user (as User documents). */
  async getFollowers(userId: string): Promise<IUser[]> {
    const follows = await Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .select("follower")
      .lean();
    const ids = (follows as Pick<IFollow, "follower">[]).map((f) => f.follower);
    if (ids.length === 0) return [];
    // Closed accounts do not appear in the list.
    return await User.find({ _id: { $in: ids }, closedAt: { $exists: false } }).lean() as unknown as IUser[];
  }

  /** The people a user follows (as User documents). */
  async getFollowing(userId: string): Promise<IUser[]> {
    const follows = await Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .select("following")
      .lean();
    const ids = (follows as Pick<IFollow, "following">[]).map((f) => f.following);
    if (ids.length === 0) return [];
    // Closed accounts do not appear in the list.
    return await User.find({ _id: { $in: ids }, closedAt: { $exists: false } }).lean() as unknown as IUser[];
  }
}

export const followRepository = new FollowRepository();
