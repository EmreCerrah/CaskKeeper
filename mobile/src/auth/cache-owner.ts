/**
 * @file cache-owner.ts
 * @description Whether the data on this device belongs to the person signing
 * in — PURE.
 *
 * The cache is only emptied on an explicit sign-out. Two paths never reach it:
 * a token that expires is cleared quietly on the next launch, and signing in
 * does not touch what is already stored. So on a shared phone the previous
 * person's notes can still be in the cache when the next one arrives — and,
 * since a write made offline is queued in that same store and takes its token
 * at the moment it is REPLAYED, their unsent note can be posted into the new
 * arrival's account.
 *
 * Clearing on every suspicion would fix that and punish the innocent case: the
 * same user coming back after their token expired would lose a note they wrote
 * offline. So the question is not "is this suspicious" but "is this the same
 * person", and it is answered here, away from the store and the network.
 */

export type CacheDecision = "keep" | "discard";

/**
 * @param owner The user the cached data belongs to, or null if nothing claimed it.
 * @param signingIn The user who is signing in now.
 */
export function decideCache(owner: string | null, signingIn: string): CacheDecision {
  // Nobody claimed it. Either the store is empty — discarding costs nothing —
  // or it was filled by a version that did not record an owner, and there is
  // no way to tell whose it is. Both answers are the same, and it is the safe
  // one: a needless refetch beats showing one person another's notes.
  if (owner === null) return "discard";

  // The same person returning. Their cache is theirs, and so is anything still
  // queued — including a note written offline that outlived their token. This
  // is the case worth protecting; it is also what finally sends that note.
  if (owner === signingIn) return "keep";

  return "discard";
}
