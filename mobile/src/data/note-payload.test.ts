import { describe, it, expect } from "vitest";
import { toNotePayload, toggleTag, type NoteFormState } from "./note-payload";

function form(overrides: Partial<NoteFormState> = {}): NoteFormState {
  return {
    whiskeyId: "aaaaaaaaaaaaaaaaaaaaaaaa",
    tastingDate: new Date("2026-08-09T00:00:00.000Z"),
    rating: 88,
    noseTags: [],
    noseNotes: "",
    palateTags: [],
    palateNotes: "",
    finishTags: [],
    finishNotes: "",
    finishLength: "medium",
    personalNotes: "",
    visibility: "private",
    isFavorite: false,
    ...overrides,
  };
}

/**
 * Mistakes in this transformation are silent: the server returns 400, the user
 * sees "could not save" and has no way to know why. So the rules are pinned
 * here.
 */
describe("toNotePayload", () => {
  it("sends the date as ISO", () => {
    expect(toNotePayload(form()).tastingDate).toBe("2026-08-09T00:00:00.000Z");
  });

  it("clamps the score to an integer in 0-100", () => {
    // The slider can produce decimals; the schema on the server expects an
    // integer.
    expect(toNotePayload(form({ rating: 87.6 })).rating).toBe(88);
    expect(toNotePayload(form({ rating: -5 })).rating).toBe(0);
    expect(toNotePayload(form({ rating: 140 })).rating).toBe(100);
  });

  it("never sends empty text fields", () => {
    const payload = toNotePayload(form({ noseNotes: "   ", personalNotes: "" }));
    expect(payload.noseNotes).toBeUndefined();
    expect(payload.personalNotes).toBeUndefined();
  });

  it("trims surrounding whitespace from non-empty text", () => {
    expect(toNotePayload(form({ palateNotes: "  bal ve meşe  " })).palateNotes).toBe("bal ve meşe");
  });

  it("drops duplicate and blank tags while KEEPING the order", () => {
    // The order has to survive: the user sees the order they picked.
    const payload = toNotePayload(form({ noseTags: ["Bal (Honey)", "", "Bal (Honey)", "Meşe (Oak)"] }));
    expect(payload.noseTags).toEqual(["Bal (Honey)", "Meşe (Oak)"]);
  });

  it("does NOT translate or reformat tags", () => {
    // These are the stored values; the statistics match on this exact text.
    const tag = "Tıbbi/İyot (Medicinal/Iodine)";
    expect(toNotePayload(form({ finishTags: [tag] })).finishTags).toEqual([tag]);
  });

  it("carries the visibility and favourite fields through unchanged", () => {
    const payload = toNotePayload(form({ visibility: "public", isFavorite: true }));
    expect(payload.visibility).toBe("public");
    expect(payload.isFavorite).toBe(true);
  });
});

describe("toggleTag", () => {
  it("adds a missing tag, at the end", () => {
    expect(toggleTag(["a"], "b")).toEqual(["a", "b"]);
  });

  it("removes a tag that is present", () => {
    expect(toggleTag(["a", "b"], "a")).toEqual(["b"]);
  });

  it("does not mutate the input", () => {
    const original = ["a"];
    toggleTag(original, "b");
    expect(original).toEqual(["a"]);
  });
});
