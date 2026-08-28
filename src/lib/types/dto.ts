/**
 * @file dto.ts
 * @description The DTO types that make up the API contract, and the Mongoose →
 * DTO converters. Server components and API routes always return these plain,
 * serialisable types to the client — Mongoose documents never leak into the UI
 * layer. That boundary is what would make a later move to a Spring Boot backend
 * a matter of reimplementing the layers behind it.
 */

import type { IWhiskey } from "@/server/models/Whiskey";
import type { ITastingNote } from "@/server/models/TastingNote";
import type { IUser } from "@/server/models/User";
import type { IComment } from "@/server/models/Comment";
import type { INotification, NotificationType } from "@/server/models/Notification";

/** The minimal user information shown in lists and on cards (public). */
export interface PublicUserDTO {
  id: string;
  name: string;
  profilePicture?: string;
}

// ---------------------------------------------------------------------------
// DTO types
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
 * The interaction summary for a tasting note.
 * Populated only in public views (the feed, a profile, the note page) — when
 * the field is absent the interaction bar is not rendered at all, so nothing
 * misreads as "0 likes".
 */
export interface NoteInteractionsDTO {
  likeCount: number;
  commentCount: number;
  /** Has the requester liked this note (false when signed out). */
  isLikedByViewer: boolean;
}

export interface CommentDTO {
  id: string;
  tastingNoteId: string;
  author: PublicUserDTO;
  body: string;
  createdAt: string; // ISO
  /** May the requester delete this comment (its author, or the note's owner). */
  canDelete: boolean;
}

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  actor: PublicUserDTO;
  isRead: boolean;
  createdAt: string; // ISO
  /** The tasting note a like/comment notification refers to. */
  tastingNoteId?: string;
  /** The whisky name shown in the notification text ("Lagavulin 16"). */
  whiskeyLabel?: string;
  /** The shortened comment text on a comment notification. */
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
  /** Filled in when populated. */
  whiskey?: WhiskeyDTO;
  /** Who wrote the note, in the feed and on public profiles (when populated). */
  author?: PublicUserDTO;
  /** The like/comment summary — populated only in public views. */
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
  /**
   * When the account was closed, if it was. Populated only in the admin list —
   * closed accounts are not returned by any other query.
   */
  closedAt?: string; // ISO
}

/**
 * A row in the user search / discovery list.
 * The follow relationship is carried in both directions: when each follows the
 * other, the interface shows them as a "Friend".
 */
export interface UserSearchResultDTO {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  publicNoteCount: number;
  /** Does the requester follow this person. */
  isFollowedByViewer: boolean;
  /** Does this person follow the requester. */
  isFollowingViewer: boolean;
  /** A mutual follow — shown as a "Friend" badge in the interface. */
  isMutual: boolean;
}

/** The public profile other users can see (it carries no email address). */
export interface PublicProfileDTO {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  createdAt: string; // ISO
  followerCount: number;
  followingCount: number;
  publicNoteCount: number;
  /** Does the requester follow this profile (when signed in). */
  isFollowedByViewer: boolean;
  /** Does this profile follow the requester. */
  isFollowingViewer: boolean;
  /** A mutual follow — shown as a "Friend" badge in the interface. */
  isMutual: boolean;
  /** Is the profile being viewed the requester's own. */
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
// Detailed statistics (Phase 3 · Slice A)
// ---------------------------------------------------------------------------

export interface FlavorTrendCategoryDTO {
  /** The aroma wheel category id (e.g. "fruity") — used to pick the chart colour. */
  category: string;
  /** The Turkish category label (e.g. "Meyvemsi (Fruity)"). */
  label: string;
  count: number;
}

export interface FlavorTrendPointDTO {
  /** "YYYY-MM" */
  period: string;
  total: number;
  categories: FlavorTrendCategoryDTO[];
}

export interface DistributionItemDTO {
  label: string;
  count: number;
}

export interface CatalogDistributionDTO {
  byType: DistributionItemDTO[];
  byRegion: DistributionItemDTO[];
  /** The eight most-tasted distilleries. */
  byDistillery: DistributionItemDTO[];
}

export interface AnalyticsDTO {
  flavorTrend: FlavorTrendPointDTO[];
  distribution: CatalogDistributionDTO;
}

// ---------------------------------------------------------------------------
// Wishlist (Phase 3 · Slice C)
// ---------------------------------------------------------------------------

export interface WishlistItemDTO {
  whiskey: WhiskeyDTO;
  /** When it was added to the wishlist (ISO). */
  addedAt: string;
}

// ---------------------------------------------------------------------------
// Recommendation engine (Phase 3 · Slice B)
// ---------------------------------------------------------------------------

export interface RecommendationDTO {
  whiskey: WhiskeyDTO;
  /** Match score between 0 and 1 — how much of this whisky the palate profile covers. */
  score: number;
  /** The categories behind the score, strongest first (the "why this" in the UI). */
  matchedCategories: { category: string; label: string }[];
}

// ---------------------------------------------------------------------------
// Converters
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

/** Works out whether a reference field was populated, by looking for the given key. */
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
  // The whiskey and user fields may be populated (an object) or an ObjectId
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
 * @param canDelete Deletion rights are worked out in the service layer (the author, or the note's owner)
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

  // When tastingNote is populated, the whiskey inside it is populated too
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
    closedAt: u.closedAt ? new Date(u.closedAt).toISOString() : undefined,
  };
}
