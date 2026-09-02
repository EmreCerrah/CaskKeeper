import { describe, it, expect } from "vitest";
import {
  addNote,
  failNote,
  isPendingNoteId,
  optimisticNote,
  pendingNoteId,
  removeNote,
  replaceNote,
  type NotePage,
} from "./note-cache";
import type { TastingNote, TastingNoteInput } from "./tastingNotes";

/**
 * The list is edited by hand while a note waits to be sent, which means the
 * `total` in the page header and the rows under it can disagree. Nothing
 * throws when they do — the screen simply says "4 tasting notes" above three
 * cards, and stays wrong until a refetch nobody asks for.
 */

const whiskey = { id: "w1", brand: "Ardbeg", name: "10 Year Old" };

const input: TastingNoteInput = {
  whiskey: "w1",
  tastingDate: "2026-08-30T00:00:00.000Z",
  rating: 88,
  noseTags: ["peat"],
  palateTags: [],
  finishTags: [],
  finishLength: "long",
  visibility: "private",
  isFavorite: false,
};

function note(id: string, extra: Partial<TastingNote> = {}): TastingNote {
  return { ...optimisticNote(id, input, whiskey), ...extra };
}

function page(data: TastingNote[], total = data.length): NotePage {
  return { data, total, page: 1, limit: 50, totalPages: 1 };
}

describe("pending ids", () => {
  it("marks an id the server has never seen", () => {
    expect(isPendingNoteId(pendingNoteId("123"))).toBe(true);
  });

  it("does not mistake a real id for a pending one", () => {
    expect(isPendingNoteId("652f1c9e4b3a2d1f00a1b2c3")).toBe(false);
  });
});

describe("optimisticNote", () => {
  it("carries the whisky so the card is not blank while it waits", () => {
    const built = optimisticNote("pending:1", input, whiskey);

    expect(built.whiskey?.brand).toBe("Ardbeg");
    expect(built.whiskey?.name).toBe("10 Year Old");
    expect(built.whiskeyId).toBe("w1");
  });

  it("starts as pending", () => {
    expect(optimisticNote("pending:1", input, whiskey).localStatus).toBe("pending");
  });

  it("takes the date from the input, not the clock, so the card does not change on save", () => {
    const built = optimisticNote("pending:1", input, whiskey);

    expect(built.tastingDate).toBe(input.tastingDate);
    expect(built.createdAt).toBe(input.tastingDate);
  });
});

describe("addNote", () => {
  it("puts the note first and increments the total", () => {
    const result = addNote(page([note("a")]), note("pending:1"));

    expect(result?.data.map((n) => n.id)).toEqual(["pending:1", "a"]);
    expect(result?.total).toBe(2);
  });

  it("leaves an unread cache alone rather than inventing a page", () => {
    expect(addNote(undefined, note("pending:1"))).toBeUndefined();
  });
});

describe("replaceNote", () => {
  it("swaps the placeholder for the saved note in place", () => {
    const saved = note("real", { localStatus: undefined });
    const result = replaceNote(page([note("pending:1"), note("a")]), "pending:1", saved);

    // Position kept: the row must not jump when the connection returns.
    expect(result?.data.map((n) => n.id)).toEqual(["real", "a"]);
    expect(result?.data[0].localStatus).toBeUndefined();
  });

  it("does not change the total — one note became one note", () => {
    const result = replaceNote(page([note("pending:1")], 1), "pending:1", note("real"));

    expect(result?.total).toBe(1);
  });

  it("adds nothing when the placeholder is gone", () => {
    // The list was refetched between the write and the reply, so the real note
    // is already in it. Appending here would show it twice.
    const refetched = page([note("real")]);
    const result = replaceNote(refetched, "pending:1", note("real"));

    expect(result?.data.map((n) => n.id)).toEqual(["real"]);
    expect(result?.total).toBe(1);
  });
});

describe("failNote", () => {
  it("keeps the note and its words, and records why", () => {
    const result = failNote(page([note("pending:1")]), "pending:1", "Whisky not found");

    expect(result?.data).toHaveLength(1);
    expect(result?.data[0].localStatus).toBe("failed");
    expect(result?.data[0].localError).toBe("Whisky not found");
    expect(result?.data[0].rating).toBe(88);
  });

  it("leaves the total alone — the row is still on screen", () => {
    const result = failNote(page([note("pending:1")], 1), "pending:1", "nope");

    expect(result?.total).toBe(1);
  });
});

describe("removeNote", () => {
  it("drops the note and decrements the total", () => {
    const result = removeNote(page([note("pending:1"), note("a")]), "pending:1");

    expect(result?.data.map((n) => n.id)).toEqual(["a"]);
    expect(result?.total).toBe(1);
  });

  it("changes nothing when the note is not there", () => {
    const before = page([note("a")]);

    expect(removeNote(before, "pending:1")).toBe(before);
  });

  it("never drives the total below zero", () => {
    const result = removeNote(page([note("pending:1")], 0), "pending:1");

    expect(result?.total).toBe(0);
  });
});
