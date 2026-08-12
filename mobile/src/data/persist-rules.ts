/**
 * @file persist-rules.ts
 * @description Decides which queries are written to disk — PURE.
 *
 * This function is also a PRIVACY BOUNDARY. It alone determines what stays on
 * the device, which is why it sits apart from the network and the store, and
 * why it has tests.
 *
 * The decision (agreed with the user): your own tasting notes, the catalogue
 * and your own statistics are stored. Other people's data — the feed,
 * profiles — is not.
 */

/** Query roots that are written to persistent storage. */
const PERSISTED_ROOTS = ["whiskeys", "aromaWheel", "dashboard", "analytics", "wishlist"] as const;

export function shouldPersistQuery(queryKey: readonly unknown[]): boolean {
  const [root, scope] = queryKey;

  if (typeof root !== "string") return false;

  // The catalogue: shared, not personal. This is the case offline is really
  // for — looking up a bottle in a bar with no signal.
  //
  // Dashboard and statistics: computed from the user's OWN notes, so the same
  // rule as "your own notes are stored". They contain nobody else's data.
  //
  // The wishlist: your own data again, and the whiskies in it come from the
  // catalogue, which is already stored. "What was I meaning to buy" in a bar
  // is squarely the offline case. Adding and removing still need the network —
  // offline WRITING is its own job.
  if ((PERSISTED_ROOTS as readonly string[]).includes(root)) return true;

  // Recommendations are not stored. Nothing technical stops it; it is a
  // deliberate choice. The server recomputes the list from the palate profile
  // with every new note, so a stored copy would sit there saying "we recommend
  // this" long after it stopped being true. The catalogue behind it is cached
  // anyway — the only thing lost is the ranking.

  // Of the tasting notes, ONLY the "mine" branch is stored.
  //
  // `detail` is not, because the same key also serves SOMEBODY ELSE'S note
  // opened from the feed, and the key cannot tell the two apart. The price:
  // offline, tapping a note in the list fails. The list card already shows the
  // whisky, the score and the date.
  if (root === "tastingNotes") return scope === "mine";

  // Feed and users: other people's notes and profiles. Never.
  return false;
}
