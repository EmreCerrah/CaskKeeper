/**
 * @file keys.ts
 * @description Query keys in one place.
 *
 * Scattered, every screen would invent its own array and two screens would
 * fetch the same data twice under different keys. More importantly: when
 * offline persistence arrived, "what do we store" was answered in terms of
 * these keys — so they have to stay tidy.
 *
 * `mutationKeys` at the bottom answers the same question for writes, and it is
 * load-bearing rather than tidiness: a mutation paused offline is written to
 * disk WITHOUT its function, and the key is the only thing that can find that
 * function again after a restart (see mutation-defaults.ts).
 */

export interface WhiskeyListParams {
  search?: string;
  type?: string;
  region?: string;
  country?: string;
}

export const queryKeys = {
  whiskeys: {
    all: ["whiskeys"] as const,
    list: (params: WhiskeyListParams) => ["whiskeys", "list", params] as const,
    detail: (slug: string) => ["whiskeys", "detail", slug] as const,
    facets: () => ["whiskeys", "facets"] as const,
  },
  tastingNotes: {
    /** Shared root for invalidating the whole note cache after a write. */
    all: ["tastingNotes"] as const,
    mine: () => ["tastingNotes", "mine"] as const,
    detail: (id: string) => ["tastingNotes", "detail", id] as const,
  },
  aromaWheel: () => ["aromaWheel"] as const,
  feed: () => ["feed"] as const,
  comments: {
    all: ["comments"] as const,
    list: (noteId: string) => ["comments", "list", noteId] as const,
  },
  notifications: {
    /** Marking as read must refresh both the list and the badge. */
    all: ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
    /** A separate, light query for the badge — it does not carry 20 notifications. */
    unread: () => ["notifications", "unread"] as const,
  },
  /** The dashboard's summary figures — stale as soon as a note is written. */
  dashboard: () => ["dashboard"] as const,
  /** Aroma trend + catalogue distribution. */
  analytics: () => ["analytics"] as const,
  /** Recommendations computed from the palate profile. */
  recommendations: () => ["recommendations"] as const,
  wishlist: {
    /** Refreshes both the list and a single whisky's state after add/remove. */
    all: ["wishlist"] as const,
    list: () => ["wishlist", "list"] as const,
    status: (whiskeyId: string) => ["wishlist", "status", whiskeyId] as const,
  },
  users: {
    /** A follow change must also refresh the states in search results. */
    all: ["users"] as const,
    search: (query: string) => ["users", "search", query] as const,
    profile: (id: string) => ["users", "profile", id] as const,
    notes: (id: string) => ["users", "notes", id] as const,
  },
} as const;

/**
 * Keys for the writes that survive being offline.
 *
 * Only the writes whose screen can be OPENED offline are here. The rest are
 * absent on purpose: liking, commenting, following and marking a notification
 * read all need data that persist-rules.ts deliberately keeps off the device,
 * so their screens do not open without a connection and the write can never be
 * started in the first place.
 *
 * A write with no key here behaves as it always has — offline it fails, and the
 * user sees the error straight away.
 */
export const mutationKeys = {
  wishlist: {
    toggle: () => ["wishlist", "toggle"] as const,
  },
} as const;
