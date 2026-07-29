/**
 * @file UserRepository.ts
 * @description User koleksiyonu için MongoDB erişim katmanı.
 */

import User, { IUser } from "../models/User";
import { escapeRegex } from "@/lib/utils/normalize";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: "user" | "admin";
}

export interface UpdateUserInput {
  name?: string;
  bio?: string;
  profilePicture?: string;
}

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id).lean() as IUser | null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() }).lean() as IUser | null;
  }

  /** Login için — passwordHash select:false olduğundan açıkça istenir */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() })
      .select("+passwordHash")
      .lean() as IUser | null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return !!(await User.exists({ email: email.toLowerCase() }));
  }

  /** Toplam kullanıcı sayısı — ilk kaydın admin olması için kullanılır */
  async count(): Promise<number> {
    return await User.countDocuments();
  }

  /** Yönetim panelinde kullanıcı listesi (en yeni önce) */
  async findAll(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 }).lean() as unknown as IUser[];
  }

  /**
   * İsme göre kullanıcı arar (büyük/küçük harf duyarsız, kısmi eşleşme).
   * E-posta üzerinden arama bilinçli olarak desteklenmez — kullanıcıların
   * e-postaları başkaları tarafından keşfedilebilir olmamalı.
   */
  async searchByName(query: string, limit = 20, excludeId?: string): Promise<IUser[]> {
    const filter: Record<string, unknown> = { name: new RegExp(escapeRegex(query), "i") };
    if (excludeId) filter._id = { $ne: excludeId };

    return await User.find(filter)
      .sort({ name: 1 })
      .limit(limit)
      .lean() as unknown as IUser[];
  }

  /** Keşfet listesi: arama yapılmadığında gösterilecek kullanıcılar */
  async findRecent(limit = 20, excludeIds: string[] = []): Promise<IUser[]> {
    const filter = excludeIds.length ? { _id: { $nin: excludeIds } } : {};

    return await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean() as unknown as IUser[];
  }

  /** Kaç admin var — son admini düşürmeyi engellemek için */
  async countAdmins(): Promise<number> {
    return await User.countDocuments({ role: "admin" });
  }

  async updateRole(id: string, role: "user" | "admin"): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { $set: { role } }, { new: true })
      .lean() as unknown as IUser | null;
  }

  async create(data: CreateUserInput): Promise<IUser> {
    const user = new User(data);
    const saved = await user.save();
    // passwordHash'i döndürülen objeden çıkar
    const plain = saved.toObject() as unknown as Record<string, unknown>;
    delete plain.passwordHash;
    return plain as unknown as IUser;
  }

  async update(id: string, data: UpdateUserInput): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { $set: data }, { new: true }).lean() as IUser | null;
  }
}

export const userRepository = new UserRepository();
