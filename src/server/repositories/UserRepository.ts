/**
 * @file UserRepository.ts
 * @description The MongoDB access layer for the User collection.
 */

import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import { escapeRegex } from "@/lib/utils/normalize";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: "user" | "admin";
}

/** What is written to an account reopened by re-registration. reopen decides the role itself. */
export interface ReopenUserInput {
  name: string;
  passwordHash: string;
}

export interface UpdateUserInput {
  name?: string;
  bio?: string;
  profilePicture?: string;
}

/**
 * Accounts that have not been closed. The visibility rule is gathered HERE: a
 * closed user's profile, their appearance in search and in follower lists, and
 * their sign-in all shut off through this one filter — the layers above do not
 * have to do anything of their own.
 */
const ACTIVE = { closedAt: { $exists: false } } as const;

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return await User.findOne({ _id: id, ...ACTIVE }).lean() as IUser | null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase(), ...ACTIVE }).lean() as IUser | null;
  }

  /**
   * For sign-in — passwordHash is select:false, so it is asked for explicitly.
   *
   * The active filter is critical: a closed row keeps its email, so where an
   * account was closed and re-registered before that behaviour changed, the
   * collection holds TWO rows for that address. Without the filter, sign-in
   * would find the wrong one.
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase(), ...ACTIVE })
      .select("+passwordHash")
      .lean() as IUser | null;
  }

  /** For verifying the password before closing an account. */
  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return await User.findOne({ _id: id, ...ACTIVE })
      .select("+passwordHash")
      .lean() as IUser | null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return !!(await User.exists({ email: email.toLowerCase(), ...ACTIVE }));
  }

  /**
   * Total user count — used to make the first registration an administrator.
   *
   * Closed accounts are counted DELIBERATELY: even if everyone closed their
   * account, the next registration should not quietly become an admin.
   */
  async count(): Promise<number> {
    return await User.countDocuments();
  }

  /**
   * The user list in the admin panel (newest first).
   * Closed accounts are included — this is the only window an operator has onto
   * them.
   */
  async findAll(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 }).lean() as unknown as IUser[];
  }

  /**
   * Of the given ids, returns only those belonging to open accounts.
   * The feed receives its author ids from elsewhere, so it can be filtered
   * without a join.
   */
  async filterActiveIds(ids: mongoose.Types.ObjectId[]): Promise<mongoose.Types.ObjectId[]> {
    if (ids.length === 0) return [];

    const rows = await User.find({ _id: { $in: ids }, ...ACTIVE }).select("_id").lean();
    return (rows as unknown as { _id: mongoose.Types.ObjectId }[]).map((r) => r._id);
  }

  /** How many of the given ids have an open account — for follower/following counts. */
  async countActiveByIds(ids: mongoose.Types.ObjectId[]): Promise<number> {
    if (ids.length === 0) return 0;
    return await User.countDocuments({ _id: { $in: ids }, ...ACTIVE });
  }

  /**
   * Searches users by name (case-insensitive, partial match).
   * Searching by email is deliberately unsupported — people's email addresses
   * should not be discoverable by others.
   */
  async searchByName(query: string, limit = 20, excludeId?: string): Promise<IUser[]> {
    const filter: Record<string, unknown> = { name: new RegExp(escapeRegex(query), "i"), ...ACTIVE };
    if (excludeId) filter._id = { $ne: excludeId };

    return await User.find(filter)
      .sort({ name: 1 })
      .limit(limit)
      .lean() as unknown as IUser[];
  }

  /** The discovery list: who to show when no search has been made. */
  async findRecent(limit = 20, excludeIds: string[] = []): Promise<IUser[]> {
    const filter: Record<string, unknown> = excludeIds.length
      ? { _id: { $nin: excludeIds }, ...ACTIVE }
      : { ...ACTIVE };

    return await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean() as unknown as IUser[];
  }

  /** How many OPEN admins there are — to stop the last one being demoted or closed. */
  async countAdmins(): Promise<number> {
    return await User.countDocuments({ role: "admin", ...ACTIVE });
  }

  /** Closes the account. It can be reopened — see reopen. */
  async close(id: string): Promise<boolean> {
    const result = await User.updateOne({ _id: id, ...ACTIVE }, { $set: { closedAt: new Date() } });
    return result.modifiedCount > 0;
  }

  /**
   * Finds a closed account by its email — the exact inverse of the ACTIVE
   * filter.
   *
   * Used only on the re-registration path: when somebody registers with that
   * address, this row is reopened instead of a new one being created.
   */
  async findClosedByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({
      email: email.toLowerCase(),
      closedAt: { $exists: true },
    }).lean() as IUser | null;
  }

  /**
   * Reopens a closed account with a new password.
   *
   * The role ALWAYS drops to "user", even if the old account was an
   * administrator. Registration proves no identity (there is no email
   * verification), so anyone who knows the address can take this path — handing
   * privilege back as well would make a closed admin account capturable.
   * Restoring the role is a separate decision, made by an admin through
   * updateRole.
   *
   * closedAt is $unset rather than set to an empty date: the ACTIVE filter
   * tests for the ABSENCE of the field, and the compound index counts a missing
   * field as null.
   */
  async reopen(id: string, data: ReopenUserInput): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { _id: id, closedAt: { $exists: true } },
      { $unset: { closedAt: "" }, $set: { ...data, role: "user" } },
      { new: true }
    ).lean() as unknown as IUser | null;
  }

  async updateRole(id: string, role: "user" | "admin"): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { $set: { role } }, { new: true })
      .lean() as unknown as IUser | null;
  }

  async create(data: CreateUserInput): Promise<IUser> {
    const user = new User(data);
    const saved = await user.save();
    // Strip passwordHash from the returned object
    const plain = saved.toObject() as unknown as Record<string, unknown>;
    delete plain.passwordHash;
    return plain as unknown as IUser;
  }

  async update(id: string, data: UpdateUserInput): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { $set: data }, { new: true }).lean() as IUser | null;
  }
}

export const userRepository = new UserRepository();
