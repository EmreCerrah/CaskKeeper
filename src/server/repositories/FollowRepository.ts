/**
 * @file FollowRepository.ts
 * @description Takip ilişkileri için MongoDB erişim katmanı.
 */

import mongoose from "mongoose";
import Follow, { IFollow } from "../models/Follow";
import User, { IUser } from "../models/User";

export class FollowRepository {
  /** Takip ilişkisi oluşturur. Zaten varsa idempotent davranır (upsert). */
  async create(followerId: string, followingId: string): Promise<void> {
    await Follow.updateOne(
      { follower: followerId, following: followingId },
      { $setOnInsert: { follower: followerId, following: followingId } },
      { upsert: true }
    );
  }

  /** Takip ilişkisini kaldırır. Silinen kayıt varsa true döner. */
  async delete(followerId: string, followingId: string): Promise<boolean> {
    const result = await Follow.deleteOne({ follower: followerId, following: followingId });
    return result.deletedCount > 0;
  }

  async exists(followerId: string, followingId: string): Promise<boolean> {
    return !!(await Follow.exists({ follower: followerId, following: followingId }));
  }

  async countFollowers(userId: string): Promise<number> {
    return await Follow.countDocuments({ following: userId });
  }

  async countFollowing(userId: string): Promise<number> {
    return await Follow.countDocuments({ follower: userId });
  }

  /** Akış için: kullanıcının takip ettiği kişilerin id listesi */
  async getFollowingIds(userId: string): Promise<mongoose.Types.ObjectId[]> {
    const docs = await Follow.find({ follower: userId }).select("following").lean();
    return (docs as Pick<IFollow, "following">[]).map((d) => d.following);
  }

  /** Kullanıcıyı takip edenlerin id listesi */
  async getFollowerIds(userId: string): Promise<mongoose.Types.ObjectId[]> {
    const docs = await Follow.find({ following: userId }).select("follower").lean();
    return (docs as Pick<IFollow, "follower">[]).map((d) => d.follower);
  }

  /**
   * Bir kullanıcının takip/takipçi ilişkilerini tek turda küme olarak döndürür.
   * Arama sonuçlarında her satır için ayrı sorgu atmamak içindir (N+1 önlenir).
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

  /** Bir kullanıcıyı takip eden kişiler (User dokümanları) */
  async getFollowers(userId: string): Promise<IUser[]> {
    const follows = await Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .select("follower")
      .lean();
    const ids = (follows as Pick<IFollow, "follower">[]).map((f) => f.follower);
    if (ids.length === 0) return [];
    return await User.find({ _id: { $in: ids } }).lean() as unknown as IUser[];
  }

  /** Bir kullanıcının takip ettiği kişiler (User dokümanları) */
  async getFollowing(userId: string): Promise<IUser[]> {
    const follows = await Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .select("following")
      .lean();
    const ids = (follows as Pick<IFollow, "following">[]).map((f) => f.following);
    if (ids.length === 0) return [];
    return await User.find({ _id: { $in: ids } }).lean() as unknown as IUser[];
  }
}

export const followRepository = new FollowRepository();
