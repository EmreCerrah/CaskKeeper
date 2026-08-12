import { describe, it, expect } from "vitest";
import {
  adjustCommentCount,
  adjustCommentCountInPages,
  toggleLikeInPages,
  toggleLikeOnNote,
  type InfiniteData,
  type LikeableNote,
} from "./interaction-cache";

function note(id: string, likeCount: number, liked: boolean, commentCount = 0): LikeableNote {
  return { id, interactions: { likeCount, commentCount, isLikedByViewer: liked } };
}

function pages(): InfiniteData<LikeableNote> {
  return {
    pageParams: [1, 2],
    pages: [
      { data: [note("a", 3, false), note("b", 0, false)], total: 4, page: 1, limit: 2, totalPages: 2 },
      { data: [note("c", 7, true), note("d", 1, false)], total: 4, page: 2, limit: 2, totalPages: 2 },
    ],
  };
}

describe("toggleLikeOnNote", () => {
  it("likes: increments the count and flips the flag", () => {
    const result = toggleLikeOnNote(note("a", 3, false));
    expect(result.interactions).toMatchObject({ likeCount: 4, isLikedByViewer: true });
  });

  it("unlikes: decrements the count", () => {
    const result = toggleLikeOnNote(note("a", 3, true));
    expect(result.interactions).toMatchObject({ likeCount: 2, isLikedByViewer: false });
  });

  it("never lets the count go negative", () => {
    // If the cache and the server drift apart for a moment, "-1 likes" must
    // not appear on screen.
    const result = toggleLikeOnNote(note("a", 0, true));
    expect(result.interactions?.likeCount).toBe(0);
  });

  it("does not crash when there is no interaction data at all", () => {
    const result = toggleLikeOnNote({ id: "a" });
    expect(result.interactions).toMatchObject({ likeCount: 1, isLikedByViewer: true });
  });

  it("does not mutate the input", () => {
    const original = note("a", 3, false);
    toggleLikeOnNote(original);
    expect(original.interactions).toMatchObject({ likeCount: 3, isLikedByViewer: false });
  });
});

describe("toggleLikeInPages", () => {
  it("finds and updates a note on the second page", () => {
    const result = toggleLikeInPages(pages(), "c");
    expect(result?.pages[1].data[0].interactions).toMatchObject({ likeCount: 6, isLikedByViewer: false });
  });

  it("changes ONLY the target note", () => {
    // This is the real risk: corrupting the wrong note or the wrong page while
    // walking them.
    const result = toggleLikeInPages(pages(), "b");
    const untouched = [
      result?.pages[0].data[0],
      result?.pages[1].data[0],
      result?.pages[1].data[1],
    ];

    expect(result?.pages[0].data[1].interactions?.likeCount).toBe(1);
    expect(untouched.map((n) => n?.interactions?.likeCount)).toEqual([3, 7, 1]);
  });

  it("preserves page boundaries and totals", () => {
    const result = toggleLikeInPages(pages(), "a");
    expect(result?.pages.map((p) => p.data.length)).toEqual([2, 2]);
    expect(result?.pages.map((p) => p.total)).toEqual([4, 4]);
    expect(result?.pageParams).toEqual([1, 2]);
  });

  it("changes nothing for a note that is not there", () => {
    const before = pages();
    const result = toggleLikeInPages(before, "yok");
    expect(result).toEqual(before);
  });

  it("does not crash on an empty cache", () => {
    expect(toggleLikeInPages(undefined, "a")).toBeUndefined();
  });
});

describe("adjustCommentCount", () => {
  it("goes up when a comment is added and down when one is deleted", () => {
    expect(adjustCommentCount(note("a", 0, false, 2), 1).interactions.commentCount).toBe(3);
    expect(adjustCommentCount(note("a", 0, false, 2), -1).interactions.commentCount).toBe(1);
  });

  it("never lets the count go negative", () => {
    expect(adjustCommentCount(note("a", 0, false, 0), -1).interactions.commentCount).toBe(0);
  });

  it("leaves the like data alone", () => {
    const result = adjustCommentCount(note("a", 5, true, 1), 1);
    expect(result.interactions).toMatchObject({ likeCount: 5, isLikedByViewer: true, commentCount: 2 });
  });

  it("does not crash when there is no interaction data at all", () => {
    expect(adjustCommentCount({ id: "a" }, 1).interactions.commentCount).toBe(1);
  });

  it("does not mutate the input", () => {
    const input = note("a", 0, false, 1);
    adjustCommentCount(input, 1);
    expect(input.interactions?.commentCount).toBe(1);
  });
});

describe("adjustCommentCountInPages", () => {
  function commentPages(): InfiniteData<LikeableNote> {
    return {
      pageParams: [1, 2],
      pages: [
        { data: [note("a", 0, false, 1), note("b", 0, false, 4)], total: 4, page: 1, limit: 2, totalPages: 2 },
        { data: [note("c", 0, false, 0), note("d", 0, false, 9)], total: 4, page: 2, limit: 2, totalPages: 2 },
      ],
    };
  }

  it("changes ONLY the target note's comment count", () => {
    const result = adjustCommentCountInPages(commentPages(), "b", 1);

    expect(result?.pages[0].data[1].interactions?.commentCount).toBe(5);
    expect(
      [result?.pages[0].data[0], result?.pages[1].data[0], result?.pages[1].data[1]].map(
        (n) => n?.interactions?.commentCount
      )
    ).toEqual([1, 0, 9]);
  });

  it("preserves page boundaries and totals", () => {
    const result = adjustCommentCountInPages(commentPages(), "a", -1);
    expect(result?.pages.map((p) => p.data.length)).toEqual([2, 2]);
    expect(result?.pages.map((p) => p.total)).toEqual([4, 4]);
    expect(result?.pageParams).toEqual([1, 2]);
  });

  it("is safe for a missing note and an empty cache", () => {
    const before = commentPages();
    expect(adjustCommentCountInPages(before, "yok", 1)).toEqual(before);
    expect(adjustCommentCountInPages(undefined, "a", 1)).toBeUndefined();
  });
});
