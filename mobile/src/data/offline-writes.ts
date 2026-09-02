import type { TastingNoteInput } from "./tastingNotes";

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
  body?: unknown;
}

export function wishlistToggleRequest(variables: WishlistToggleVariables): WriteRequest {
  return {
    path: `/api/wishlist/${variables.whiskey.id}`,
    method: variables.wishlisted ? "DELETE" : "POST",
  };
}

/**
 * Sent with a new tasting note.
 *
 * `input` is the server's body and `whiskey` is not — it is carried only so the
 * card can show a name while the note waits, and it is dropped before the
 * request goes out. `pendingId` travels too, because the handlers that replace
 * or fail the placeholder run long after the tap and have no other way to find
 * the row they belong to.
 */
export interface CreateNoteVariables {
  input: TastingNoteInput;
  whiskey: { id: string; brand: string; name: string };
  pendingId: string;
}

export function createNoteRequest(variables: CreateNoteVariables): WriteRequest {
  return {
    path: "/api/tasting-notes",
    method: "POST",
    // Only `input`. Sending the whole variables object would post `whiskey` and
    // `pendingId` as well, and the server's schema rejects unknown fields.
    body: variables.input,
  };
}

/**
 * Whether sending the same request again could plausibly succeed.
 *
 * The distinction only matters once a write can be replayed with nobody
 * watching: a single flaky answer would otherwise put a permanent "failed" on
 * a note that needed asking twice, while a request refused for what it
 * CONTAINS would be asked forever.
 *
 * 401 is NOT here. Retrying with the same expired token fails the same way,
 * and the app cannot hold the write across a fresh sign-in — the queue is
 * cleared on sign-out on purpose (AuthContext). The note is kept and shown as
 * failed instead, so the words survive even though the request did not.
 */
export function isRetryableStatus(status: number): boolean {
  // 0 is what the API client reports when the server was never reached.
  if (status === 0) return true;
  return status >= 500;
}
