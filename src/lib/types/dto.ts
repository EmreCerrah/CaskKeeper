/**
 * @file dto.ts
 * @description API kontratını oluşturan DTO tipleri ve Mongoose → DTO dönüştürücüleri.
 * Server component'ler ve API route'lar istemciye her zaman bu düz (serializable)
 * tipleri döndürür — Mongoose dokümanları asla UI katmanına sızmaz.
 * Bu ayrım ileride Spring Boot backend'e geçişi kolaylaştırır.
 */

import type { IWhiskey } from "@/server/models/Whiskey";
import type { ITastingNote } from "@/server/models/TastingNote";
import type { IUser } from "@/server/models/User";

/** Listelerde/kartlarda gösterilen minimal kullanıcı bilgisi (herkese açık) */
export interface PublicUserDTO {
  id: string;
  name: string;
  profilePicture?: string;
}

// ---------------------------------------------------------------------------
// DTO Tipleri
// ---------------------------------------------------------------------------

export interface WhiskeyDTO {
  id: string;
  brand: string;
  name: string;
  slug: string;
  distillery: string;
  type: string;
  region: string;
  country: string;
  subRegion?: string;
  abv: number;
  age?: number;
  caskType?: string;
  bottlingYear?: number;
  vintage?: number;
  limitedEdition: boolean;
  description?: string;
  flavorProfile: string[];
  awards: string[];
  imageUrl?: string;
  officialUrl?: string;
  tags: string[];
}

export interface TastingNoteDTO {
  id: string;
  userId: string;
  whiskeyId: string;
  /** Populate edilmişse dolu gelir */
  whiskey?: WhiskeyDTO;
  /** Akış ve herkese açık profillerde notu yazan kullanıcı (populate edilmişse) */
  author?: PublicUserDTO;
  tastingDate: string; // ISO
  rating: number;
  noseTags: string[];
  noseNotes?: string;
  palateTags: string[];
  palateNotes?: string;
  finishTags: string[];
  finishNotes?: string;
  finishLength: "short" | "medium" | "long";
  personalNotes?: string;
  visibility: "private" | "public";
  isFavorite: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  role: "user" | "admin";
  createdAt: string; // ISO
}

/** Başka kullanıcıların görebildiği herkese açık profil (e-posta içermez) */
export interface PublicProfileDTO {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  createdAt: string; // ISO
  followerCount: number;
  followingCount: number;
  publicNoteCount: number;
  /** İsteği yapan kullanıcı bu profili takip ediyor mu (giriş yapmışsa) */
  isFollowedByViewer: boolean;
  /** Görüntülenen profil, isteği yapan kullanıcının kendisi mi */
  isOwnProfile: boolean;
}

export interface DashboardStatsDTO {
  totalNotes: number;
  distinctWhiskeys: number;
  averageRating: number | null;
  favoriteCount: number;
  topFlavorTags: { tag: string; count: number }[];
  recentNotes: TastingNoteDTO[];
}

// ---------------------------------------------------------------------------
// Dönüştürücüler
// ---------------------------------------------------------------------------

type LeanDoc = { _id: unknown; [key: string]: unknown };

export function toWhiskeyDTO(doc: IWhiskey | LeanDoc): WhiskeyDTO {
  const w = doc as IWhiskey;
  return {
    id: String(w._id),
    brand: w.brand,
    name: w.name,
    slug: w.slug,
    distillery: w.distillery,
    type: w.type,
    region: w.region,
    country: w.country,
    subRegion: w.subRegion ?? undefined,
    abv: w.abv,
    age: w.age ?? undefined,
    caskType: w.caskType ?? undefined,
    bottlingYear: w.bottlingYear ?? undefined,
    vintage: w.vintage ?? undefined,
    limitedEdition: w.limitedEdition ?? false,
    description: w.description ?? undefined,
    flavorProfile: w.flavorProfile ?? [],
    awards: w.awards ?? [],
    imageUrl: w.imageUrl ?? undefined,
    officialUrl: w.officialUrl ?? undefined,
    tags: w.tags ?? [],
  };
}

/** Bir referans alanının populate edilip edilmediğini, verilen anahtara göre anlar */
function isPopulatedRef(ref: unknown, key: string): ref is LeanDoc {
  return ref !== null && typeof ref === "object" && key in (ref as Record<string, unknown>);
}

export function toPublicUserDTO(doc: IUser | LeanDoc): PublicUserDTO {
  const u = doc as IUser;
  return {
    id: String(u._id),
    name: u.name,
    profilePicture: u.profilePicture ?? undefined,
  };
}

export function toTastingNoteDTO(doc: ITastingNote | LeanDoc): TastingNoteDTO {
  const n = doc as ITastingNote;
  // whiskey ve user alanları populate edilmiş (obje) veya ObjectId olabilir
  const whiskeyRef = n.whiskey as unknown;
  const whiskeyPopulated = isPopulatedRef(whiskeyRef, "slug");

  const userRef = n.user as unknown;
  const userPopulated = isPopulatedRef(userRef, "name");

  return {
    id: String(n._id),
    userId: userPopulated ? String((userRef as LeanDoc)._id) : String(n.user),
    whiskeyId: whiskeyPopulated ? String((whiskeyRef as LeanDoc)._id) : String(n.whiskey),
    whiskey: whiskeyPopulated ? toWhiskeyDTO(whiskeyRef as LeanDoc) : undefined,
    author: userPopulated ? toPublicUserDTO(userRef as LeanDoc) : undefined,
    tastingDate: new Date(n.tastingDate).toISOString(),
    rating: n.rating,
    noseTags: n.noseTags ?? [],
    noseNotes: n.noseNotes ?? undefined,
    palateTags: n.palateTags ?? [],
    palateNotes: n.palateNotes ?? undefined,
    finishTags: n.finishTags ?? [],
    finishNotes: n.finishNotes ?? undefined,
    finishLength: n.finishLength,
    personalNotes: n.personalNotes ?? undefined,
    visibility: n.visibility,
    isFavorite: n.isFavorite ?? false,
    createdAt: new Date(n.createdAt).toISOString(),
    updatedAt: new Date(n.updatedAt).toISOString(),
  };
}

export function toUserDTO(doc: IUser | LeanDoc): UserDTO {
  const u = doc as IUser;
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    profilePicture: u.profilePicture ?? undefined,
    bio: u.bio ?? undefined,
    role: u.role,
    createdAt: new Date(u.createdAt).toISOString(),
  };
}
