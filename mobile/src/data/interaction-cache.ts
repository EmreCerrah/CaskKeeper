/**
 * @file interaction-cache.ts
 * @description Updates a note's like and comment counts in place in the
 * cache — PURE.
 *
 * Liking is optimistic: a heart that waits for a network round trip feels
 * broken. But the feed is held in PAGES by `useInfiniteQuery`, so finding the
 * right note means walking those pages, and corrupting the wrong one is easy.
 * That is why the transformation lives here, away from the network and
 * testable.
 *
 * The comment count sits in the same `interactions` object and in the same two
 * caches, so it lives here too rather than growing a second page-walking copy.
 * The file used to be `like-cache.ts`; the name widened for that reason.
 *
 * The rule: only the target note changes. Other notes, page boundaries, totals
 * and ordering all survive untouched.
 */

export interface Interactions {
  likeCount: number;
  commentCount: number;
  isLikedByViewer: boolean;
}

export interface LikeableNote {
  id: string;
  interactions?: Interactions;
}

export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InfiniteData<T> {
  pages: Page<T>[];
  pageParams: unknown[];
}

/**
 * Flips a single note's like state.
 *
 * `interactions` is NO LONGER optional in the return type: the function
 * produces it even when the information was missing, so callers do not have to
 * check for absence a second time.
 */
export function toggleLikeOnNote<T extends LikeableNote>(note: T): T & { interactions: Interactions } {
  const current = note.interactions ?? { likeCount: 0, commentCount: 0, isLikedByViewer: false };
  const liked = !current.isLikedByViewer;

  return {
    ...note,
    interactions: {
      ...current,
      isLikedByViewer: liked,
      // The count must never go negative: if the cache and the server drift
      // apart for a moment, do not show "-1 likes".
      likeCount: Math.max(0, current.likeCount + (liked ? 1 : -1)),
    },
  };
}

/** Finds the target note in the paginated feed cache and updates it. */
export function toggleLikeInPages<T extends LikeableNote>(
  cached: InfiniteData<T> | undefined,
  noteId: string
): InfiniteData<T> | undefined {
  if (!cached) return cached;

  return {
    ...cached,
    pages: cached.pages.map((page) => ({
      ...page,
      data: page.data.map((note) => (note.id === noteId ? toggleLikeOnNote(note) : note)),
    })),
  };
}

/**
 * Shifts the comment count by `delta`.
 *
 * The comment ITSELF is not added optimistically (see comments.ts) — the
 * server returns the real one. But the count also appears on the feed card,
 * which is a separate cache; left alone, the card says "2 comments" above
 * three of them.
 */
export function adjustCommentCount<T extends LikeableNote>(
  note: T,
  delta: number
): T & { interactions: Interactions } {
  const current = note.interactions ?? { likeCount: 0, commentCount: 0, isLikedByViewer: false };

  return {
    ...note,
    interactions: {
      ...current,
      // Same guard as likes: never show "-1 comments".
      commentCount: Math.max(0, current.commentCount + delta),
    },
  };
}

/** Shifts the target note's comment count in the paginated feed cache. */
export function adjustCommentCountInPages<T extends LikeableNote>(
  cached: InfiniteData<T> | undefined,
  noteId: string,
  delta: number
): InfiniteData<T> | undefined {
  if (!cached) return cached;

  return {
    ...cached,
    pages: cached.pages.map((page) => ({
      ...page,
      data: page.data.map((note) => (note.id === noteId ? adjustCommentCount(note, delta) : note)),
    })),
  };
}
