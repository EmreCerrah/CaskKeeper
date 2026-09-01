/**
 * @file offline-writes.ts
 * @description The request shape of the writes that survive being offline — PURE.
 *
 * This is separate from mutation-defaults.ts so it can be tested: that file
 * reaches the network and the secure store, neither of which loads under Node.
 * The same split as note-payload.ts and persist-rules.ts.
 *
 * What lives here is small on purpose, but it is the part that flips silently:
 * `wishlisted` describes the state the whisky is IN, not the state being asked
 * for, so the request has to invert it. Read the wrong way round, the button
 * adds when it means to remove — and offline that mistake would sit on disk for
 * hours before anyone saw it.
 */

/** Sent with the wishlist toggle. `whiskey` carries more than the id; the optimistic update needs it. */
export interface WishlistToggleVariables {
  whiskey: { id: string };
  /** Whether the whisky IS on the list right now — the toggle reverses it. */
  wishlisted: boolean;
}

export interface WriteRequest {
  path: string;
  method: "POST" | "DELETE";
}

export function wishlistToggleRequest(variables: WishlistToggleVariables): WriteRequest {
  return {
    path: `/api/wishlist/${variables.whiskey.id}`,
    method: variables.wishlisted ? "DELETE" : "POST",
  };
}
