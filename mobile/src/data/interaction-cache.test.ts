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
  it("beğenir: sayıyı artırır, işareti çevirir", () => {
    const result = toggleLikeOnNote(note("a", 3, false));
    expect(result.interactions).toMatchObject({ likeCount: 4, isLikedByViewer: true });
  });

  it("beğeniyi kaldırır: sayıyı azaltır", () => {
    const result = toggleLikeOnNote(note("a", 3, true));
    expect(result.interactions).toMatchObject({ likeCount: 2, isLikedByViewer: false });
  });

  it("sayı asla negatife düşmez", () => {
    // Önbellek ile sunucu bir an ayrışırsa ekranda "-1 beğeni" görünmemeli.
    const result = toggleLikeOnNote(note("a", 0, true));
    expect(result.interactions?.likeCount).toBe(0);
  });

  it("etkileşim bilgisi hiç yoksa çökmez", () => {
    const result = toggleLikeOnNote({ id: "a" });
    expect(result.interactions).toMatchObject({ likeCount: 1, isLikedByViewer: true });
  });

  it("girdiyi değiştirmez", () => {
    const original = note("a", 3, false);
    toggleLikeOnNote(original);
    expect(original.interactions).toMatchObject({ likeCount: 3, isLikedByViewer: false });
  });
});

describe("toggleLikeInPages", () => {
  it("ikinci sayfadaki notu bulup günceller", () => {
    const result = toggleLikeInPages(pages(), "c");
    expect(result?.pages[1].data[0].interactions).toMatchObject({ likeCount: 6, isLikedByViewer: false });
  });

  it("YALNIZCA hedef notu değiştirir", () => {
    // Asıl risk bu: sayfalarda gezerken yanlış notu ya da yanlış sayfayı bozmak.
    const result = toggleLikeInPages(pages(), "b");
    const untouched = [
      result?.pages[0].data[0],
      result?.pages[1].data[0],
      result?.pages[1].data[1],
    ];

    expect(result?.pages[0].data[1].interactions?.likeCount).toBe(1);
    expect(untouched.map((n) => n?.interactions?.likeCount)).toEqual([3, 7, 1]);
  });

  it("sayfa sınırlarını ve toplamları korur", () => {
    const result = toggleLikeInPages(pages(), "a");
    expect(result?.pages.map((p) => p.data.length)).toEqual([2, 2]);
    expect(result?.pages.map((p) => p.total)).toEqual([4, 4]);
    expect(result?.pageParams).toEqual([1, 2]);
  });

  it("olmayan not için hiçbir şeyi değiştirmez", () => {
    const before = pages();
    const result = toggleLikeInPages(before, "yok");
    expect(result).toEqual(before);
  });

  it("önbellek boşsa çökmez", () => {
    expect(toggleLikeInPages(undefined, "a")).toBeUndefined();
  });
});

describe("adjustCommentCount", () => {
  it("yorum eklenince artar, silinince azalır", () => {
    expect(adjustCommentCount(note("a", 0, false, 2), 1).interactions.commentCount).toBe(3);
    expect(adjustCommentCount(note("a", 0, false, 2), -1).interactions.commentCount).toBe(1);
  });

  it("sayı asla negatife düşmez", () => {
    expect(adjustCommentCount(note("a", 0, false, 0), -1).interactions.commentCount).toBe(0);
  });

  it("beğeni bilgisine dokunmaz", () => {
    const result = adjustCommentCount(note("a", 5, true, 1), 1);
    expect(result.interactions).toMatchObject({ likeCount: 5, isLikedByViewer: true, commentCount: 2 });
  });

  it("etkileşim bilgisi hiç yoksa çökmez", () => {
    expect(adjustCommentCount({ id: "a" }, 1).interactions.commentCount).toBe(1);
  });

  it("girdiyi değiştirmez", () => {
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

  it("YALNIZCA hedef notun yorum sayısını değiştirir", () => {
    const result = adjustCommentCountInPages(commentPages(), "b", 1);

    expect(result?.pages[0].data[1].interactions?.commentCount).toBe(5);
    expect(
      [result?.pages[0].data[0], result?.pages[1].data[0], result?.pages[1].data[1]].map(
        (n) => n?.interactions?.commentCount
      )
    ).toEqual([1, 0, 9]);
  });

  it("sayfa sınırlarını ve toplamları korur", () => {
    const result = adjustCommentCountInPages(commentPages(), "a", -1);
    expect(result?.pages.map((p) => p.data.length)).toEqual([2, 2]);
    expect(result?.pages.map((p) => p.total)).toEqual([4, 4]);
    expect(result?.pageParams).toEqual([1, 2]);
  });

  it("olmayan not ve boş önbellek için güvenli", () => {
    const before = commentPages();
    expect(adjustCommentCountInPages(before, "yok", 1)).toEqual(before);
    expect(adjustCommentCountInPages(undefined, "a", 1)).toBeUndefined();
  });
});
