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
import type { IComment } from "@/server/models/Comment";
import type { INotification, NotificationType } from "@/server/models/Notification";

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

/**
 * Bir tadım notunun etkileşim özeti.
 * Yalnızca herkese açık görünümlerde (akış, profil, not sayfası) doldurulur —
 * alan yoksa etkileşim çubuğu gösterilmez, "0 beğeni" yanılgısı oluşmaz.
 */
export interface NoteInteractionsDTO {
  likeCount: number;
  commentCount: number;
  /** İsteği yapan kullanıcı bu notu beğenmiş mi (giriş yapmamışsa false) */
  isLikedByViewer: boolean;
}

export interface CommentDTO {
  id: string;
  tastingNoteId: string;
  author: PublicUserDTO;
  body: string;
  createdAt: string; // ISO
  /** İsteği yapan kullanıcı bu yorumu silebilir mi (yazarı ya da not sahibi) */
  canDelete: boolean;
}

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  actor: PublicUserDTO;
  isRead: boolean;
  createdAt: string; // ISO
  /** like/comment bildirimlerinde ilgili tadım notu */
  tastingNoteId?: string;
  /** Bildirim metninde gösterilen viski adı ("Lagavulin 16") */
  whiskeyLabel?: string;
  /** comment bildiriminde yorumun kısaltılmış metni */
  commentExcerpt?: string;
}

export interface NotificationListDTO {
  data: NotificationDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface TastingNoteDTO {
  id: string;
  userId: string;
  whiskeyId: string;
  /** Populate edilmişse dolu gelir */
  whiskey?: WhiskeyDTO;
  /** Akış ve herkese açık profillerde notu yazan kullanıcı (populate edilmişse) */
  author?: PublicUserDTO;
  /** Beğeni/yorum özeti — yalnızca herkese açık görünümlerde doldurulur */
  interactions?: NoteInteractionsDTO;
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

/**
 * Kullanıcı arama / keşfet listesindeki bir satır.
 * Takip ilişkisi çift yönlü tutulur: her iki taraf da birbirini takip
 * ediyorsa arayüzde "Arkadaş" olarak gösterilir.
 */
export interface UserSearchResultDTO {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  publicNoteCount: number;
  /** İsteği yapan kullanıcı bu kişiyi takip ediyor mu */
  isFollowedByViewer: boolean;
  /** Bu kişi isteği yapan kullanıcıyı takip ediyor mu */
  isFollowingViewer: boolean;
  /** Karşılıklı takip — arayüzde "Arkadaş" rozeti */
  isMutual: boolean;
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
  /** Bu profil, isteği yapan kullanıcıyı takip ediyor mu */
  isFollowingViewer: boolean;
  /** Karşılıklı takip — arayüzde "Arkadaş" rozeti */
  isMutual: boolean;
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

/**
 * @param canDelete Silme yetkisi service katmanında hesaplanır (yazar ya da not sahibi)
 */
export function toCommentDTO(doc: IComment | LeanDoc, canDelete = false): CommentDTO {
  const c = doc as IComment;
  const userRef = c.user as unknown;
  const userPopulated = isPopulatedRef(userRef, "name");

  return {
    id: String(c._id),
    tastingNoteId: String(c.tastingNote),
    author: userPopulated
      ? toPublicUserDTO(userRef as LeanDoc)
      : { id: String(c.user), name: "Bilinmeyen kullanıcı" },
    body: c.body,
    createdAt: new Date(c.createdAt).toISOString(),
    canDelete,
  };
}

const COMMENT_EXCERPT_LENGTH = 80;

export function toNotificationDTO(doc: INotification | LeanDoc): NotificationDTO {
  const n = doc as INotification;

  const actorRef = n.actor as unknown;
  const actorPopulated = isPopulatedRef(actorRef, "name");

  // tastingNote populate edildiğinde içindeki whiskey de populate edilir
  const noteRef = n.tastingNote as unknown;
  const notePopulated = isPopulatedRef(noteRef, "whiskey");
  const whiskeyRef = notePopulated ? (noteRef as LeanDoc).whiskey : undefined;
  const whiskeyPopulated = isPopulatedRef(whiskeyRef, "brand");
  const whiskey = whiskeyPopulated ? (whiskeyRef as unknown as IWhiskey) : undefined;

  const commentRef = n.comment as unknown;
  const commentPopulated = isPopulatedRef(commentRef, "body");
  const commentBody = commentPopulated ? String((commentRef as LeanDoc).body) : undefined;

  return {
    id: String(n._id),
    type: n.type,
    actor: actorPopulated
      ? toPublicUserDTO(actorRef as LeanDoc)
      : { id: String(n.actor), name: "Bilinmeyen kullanıcı" },
    isRead: n.isRead ?? false,
    createdAt: new Date(n.createdAt).toISOString(),
    tastingNoteId: n.tastingNote
      ? String(notePopulated ? (noteRef as LeanDoc)._id : n.tastingNote)
      : undefined,
    whiskeyLabel: whiskey ? `${whiskey.brand} ${whiskey.name}` : undefined,
    commentExcerpt:
      commentBody && commentBody.length > COMMENT_EXCERPT_LENGTH
        ? `${commentBody.slice(0, COMMENT_EXCERPT_LENGTH)}…`
        : commentBody,
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
