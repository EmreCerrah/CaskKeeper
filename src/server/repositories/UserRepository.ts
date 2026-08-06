/**
 * @file UserRepository.ts
 * @description User koleksiyonu için MongoDB erişim katmanı.
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

export interface UpdateUserInput {
  name?: string;
  bio?: string;
  profilePicture?: string;
}

/**
 * Kapatılmamış hesaplar. Görünürlük kuralı BURADA toplanır: kapalı bir
 * kullanıcının profili, araması, takip listelerindeki satırı ve girişi bu tek
 * filtreyle kapanır — çağıran katmanların ayrıca bir şey yapması gerekmez.
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
   * Login için — passwordHash select:false olduğundan açıkça istenir.
   *
   * Aktif filtresi kritik: kapalı satırda e-posta durmaya devam ettiği için,
   * aynı adresle yeni hesap açıldığında koleksiyonda o e-postadan İKİ satır
   * bulunur. Filtre olmasa giriş yanlış satırı bulurdu.
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase(), ...ACTIVE })
      .select("+passwordHash")
      .lean() as IUser | null;
  }

  /** Hesabı kapatmadan önce parola doğrulaması için */
  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return await User.findOne({ _id: id, ...ACTIVE })
      .select("+passwordHash")
      .lean() as IUser | null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return !!(await User.exists({ email: email.toLowerCase(), ...ACTIVE }));
  }

  /**
   * Toplam kullanıcı sayısı — ilk kaydın admin olması için kullanılır.
   *
   * Kapalı hesaplar BİLEREK sayılır: herkes hesabını kapatsa bile bir sonraki
   * kayıt sessizce yönetici olmamalı.
   */
  async count(): Promise<number> {
    return await User.countDocuments();
  }

  /**
   * Yönetim panelinde kullanıcı listesi (en yeni önce).
   * Kapalı hesaplar da döner — operatörün onları görebildiği tek yer burası.
   */
  async findAll(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 }).lean() as unknown as IUser[];
  }

  /**
   * Verilen id'lerden yalnızca açık hesaplara ait olanları döndürür.
   * Akış, yazar id'lerini dışarıdan aldığı için join yapmadan süzülebiliyor.
   */
  async filterActiveIds(ids: mongoose.Types.ObjectId[]): Promise<mongoose.Types.ObjectId[]> {
    if (ids.length === 0) return [];

    const rows = await User.find({ _id: { $in: ids }, ...ACTIVE }).select("_id").lean();
    return (rows as unknown as { _id: mongoose.Types.ObjectId }[]).map((r) => r._id);
  }

  /** Verilen id'lerden kaçının hesabı açık — takipçi/takip sayıları için */
  async countActiveByIds(ids: mongoose.Types.ObjectId[]): Promise<number> {
    if (ids.length === 0) return 0;
    return await User.countDocuments({ _id: { $in: ids }, ...ACTIVE });
  }

  /**
   * İsme göre kullanıcı arar (büyük/küçük harf duyarsız, kısmi eşleşme).
   * E-posta üzerinden arama bilinçli olarak desteklenmez — kullanıcıların
   * e-postaları başkaları tarafından keşfedilebilir olmamalı.
   */
  async searchByName(query: string, limit = 20, excludeId?: string): Promise<IUser[]> {
    const filter: Record<string, unknown> = { name: new RegExp(escapeRegex(query), "i"), ...ACTIVE };
    if (excludeId) filter._id = { $ne: excludeId };

    return await User.find(filter)
      .sort({ name: 1 })
      .limit(limit)
      .lean() as unknown as IUser[];
  }

  /** Keşfet listesi: arama yapılmadığında gösterilecek kullanıcılar */
  async findRecent(limit = 20, excludeIds: string[] = []): Promise<IUser[]> {
    const filter: Record<string, unknown> = excludeIds.length
      ? { _id: { $nin: excludeIds }, ...ACTIVE }
      : { ...ACTIVE };

    return await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean() as unknown as IUser[];
  }

  /** Kaç AÇIK admin var — son admini düşürmeyi/kapatmayı engellemek için */
  async countAdmins(): Promise<number> {
    return await User.countDocuments({ role: "admin", ...ACTIVE });
  }

  /** Hesabı kapatır. Kalıcıdır; geri açan bir metot bilerek yoktur. */
  async close(id: string): Promise<boolean> {
    const result = await User.updateOne({ _id: id, ...ACTIVE }, { $set: { closedAt: new Date() } });
    return result.modifiedCount > 0;
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
