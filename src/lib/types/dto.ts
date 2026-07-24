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

// ---------------------------------------------------------------------------
// DTO Tipleri
// ---------------------------------------------------------------------------

export interface WhiskeyDTO {
  id: string;
  brand: string;
  name: string;
  slug: string;
  distillery?: string;
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
    distillery: w.distillery ?? undefined,
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

export function toTastingNoteDTO(doc: ITastingNote | LeanDoc): TastingNoteDTO {
  const n = doc as ITastingNote;
  // whiskey alanı populate edilmiş olabilir (obje) veya ObjectId olabilir
  const whiskeyRef = n.whiskey as unknown;
  const isPopulated =
    whiskeyRef !== null &&
    typeof whiskeyRef === "object" &&
    "slug" in (whiskeyRef as Record<string, unknown>);

  return {
    id: String(n._id),
    userId: String(n.user),
    whiskeyId: isPopulated ? String((whiskeyRef as LeanDoc)._id) : String(n.whiskey),
    whiskey: isPopulated ? toWhiskeyDTO(whiskeyRef as LeanDoc) : undefined,
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
