import type { TastingNote, TastingNoteInput } from "./tastingNotes";
import type { Whiskey } from "./whiskeys";

/**
 * @file note-cache.ts
 * @description Builds the note that stands in for one still on its way to the
 * server, and edits the list cache around it — PURE.
 *
 * A note written with no connection has to appear in the list straight away.
 * Without that the user submits the form, sees nothing, concludes it was lost
 * and writes it again — and hours later both copies reach the server.
 *
 * So the list is edited by hand, which brings the same trap as the wishlist:
 * the page carries a `total` beside its contents, and updating one without the
 * other leaves the header counting differently from the rows. Hence a pure
 * module with tests, away from the network.
 */

export interface NotePage {
  data: TastingNote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Marks an id the server has never seen.
 *
 * The prefix is checked rather than kept in a separate list because the id
 * travels alone: it reaches the card, the list key and the navigation call,
 * and each of those has to be able to ask "is this real yet?" on its own.
 */
const PENDING_PREFIX = "pending:";

export function pendingNoteId(seed: string): string {
  return `${PENDING_PREFIX}${seed}`;
}

export function isPendingNoteId(id: string): boolean {
  return id.startsWith(PENDING_PREFIX);
}

/**
 * The note shown while the real one is queued.
 *
 * `whiskey` is supplied by the caller: the note the server returns carries the
 * whisky, but this one is built before any request goes out, and a card with a
 * blank title would be worse than no card at all. The catalogue screen already
 * has the whisky in hand when it sends the user here.
 *
 * `createdAt` and `tastingDate` come from the input rather than the clock, so
 * the card reads the same before and after the exchange.
 */
export function optimisticNote(
  id: string,
  input: TastingNoteInput,
  whiskey: Pick<Whiskey, "id" | "brand" | "name">
): TastingNote {
  return {
    id,
    whiskeyId: input.whiskey,
    whiskey: whiskey as Whiskey,
    tastingDate: input.tastingDate,
    rating: input.rating,
    noseTags: input.noseTags,
    noseNotes: input.noseNotes,
    palateTags: input.palateTags,
    palateNotes: input.palateNotes,
    finishTags: input.finishTags,
    finishNotes: input.finishNotes,
    finishLength: input.finishLength,
    personalNotes: input.personalNotes,
    visibility: input.visibility,
    isFavorite: input.isFavorite,
    createdAt: input.tastingDate,
    localStatus: "pending",
  };
}

/**
 * Puts the note at the FRONT of the list and increments the total.
 *
 * The front because the server orders by date, descending, and the note just
 * written is the newest thing the user has. When the real one arrives it takes
 * the same place, so the row does not jump.
 */
export function addNote(cached: NotePage | undefined, note: TastingNote): NotePage | undefined {
  if (!cached) return cached;

  return {
    ...cached,
    data: [note, ...cached.data],
    total: cached.total + 1,
  };
}

/**
 * Swaps the placeholder for what the server actually stored.
 *
 * A replacement rather than a removal and an append: the row keeps its
 * position, so a list the user is looking at does not reshuffle under them at
 * the moment the connection returns.
 */
export function replaceNote(
  cached: NotePage | undefined,
  pendingId: string,
  saved: TastingNote
): NotePage | undefined {
  if (!cached) return cached;

  const index = cached.data.findIndex((note) => note.id === pendingId);
  // Not found: the list was refetched between the write and the reply, and the
  // real note is already in it. Adding it here would show it twice.
  if (index === -1) return cached;

  const data = [...cached.data];
  data[index] = saved;

  return { ...cached, data };
}

/**
 * Marks the note as failed, keeping it and its text in the list.
 *
 * Deliberately not a removal. The user wrote this; if it can never be sent,
 * they are told why and the words stay on screen — deleting somebody's writing
 * because a request failed is the one outcome worth avoiding here.
 *
 * The total is left alone: the row is still on screen, so decrementing would
 * make the header disagree with what is visible.
 */
export function failNote(
  cached: NotePage | undefined,
  pendingId: string,
  reason: string
): NotePage | undefined {
  if (!cached) return cached;

  const index = cached.data.findIndex((note) => note.id === pendingId);
  if (index === -1) return cached;

  const data = [...cached.data];
  data[index] = { ...data[index], localStatus: "failed", localError: reason };

  return { ...cached, data };
}

/** Drops the placeholder and decrements the total — used when a failed note is dismissed. */
export function removeNote(cached: NotePage | undefined, pendingId: string): NotePage | undefined {
  if (!cached) return cached;

  const data = cached.data.filter((note) => note.id !== pendingId);
  if (data.length === cached.data.length) return cached;

  return { ...cached, data, total: Math.max(0, cached.total - 1) };
}
