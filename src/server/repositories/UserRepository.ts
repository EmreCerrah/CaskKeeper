/**
 * @file UserRepository.ts
 * @description User koleksiyonu için MongoDB erişim katmanı.
 */

import User, { IUser } from "../models/User";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
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
