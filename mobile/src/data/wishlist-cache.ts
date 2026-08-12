import type { Whiskey } from "./whiskeys";

/**
 * @file wishlist-cache.ts
 * @description Updates the wishlist cache in place — PURE.
 *
 * Adding and removing are optimistic (see wishlist.ts), which means the list
 * cache is edited by hand. Alongside its contents the list also carries a
 * `total`: update one and forget the other and the screen says "3 whiskies"
 * above two cards, without erroring anywhere. So the transformation lives away
 * from the network and has tests — the same reasoning as interaction-cache.ts.
 */

export interface WishlistItem {
  whiskey: Whiskey;
  /** When it was added to the list (ISO). */
  addedAt: string;
}

export interface WishlistPage {
  data: WishlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Removes the whisky from the list and decrements the total.
 *
 * Nothing changes if it is not in the list: the user may have removed it from
 * another device while this screen was open, and decrementing then would make
 * the count genuinely wrong.
 */
export function removeFromWishlist(
  cached: WishlistPage | undefined,
  whiskeyId: string
): WishlistPage | undefined {
  if (!cached) return cached;

  const data = cached.data.filter((item) => item.whiskey.id !== whiskeyId);
  if (data.length === cached.data.length) return cached;

  return { ...cached, data, total: Math.max(0, cached.total - 1) };
}

/**
 * Adds the whisky to the FRONT of the list and increments the total.
 *
 * The front, because the server sorts by date added, descending
 * (WishlistRepository.findByUser) — appending would mean the card disappears
 * on the next refresh and reappears at the top.
 */
export function addToWishlist(
  cached: WishlistPage | undefined,
  whiskey: Whiskey,
  addedAt: string
): WishlistPage | undefined {
  if (!cached) return cached;
  // Leave it alone if already present: a double tap or an in-flight refetch
  // must not make the same whisky appear twice.
  if (cached.data.some((item) => item.whiskey.id === whiskey.id)) return cached;

  return {
    ...cached,
    data: [{ whiskey, addedAt }, ...cached.data],
    total: cached.total + 1,
  };
}
