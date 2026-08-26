/**
 * TastingNoteService tests.
 *
 * Focus: ownership — one user's note must not leak to another, nor be edited
 * or deleted by them. The repository layer is mocked; no database connection is
 * opened.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

vi.mock("../repositories/TastingNoteRepository", () => ({
  tastingNoteRepository: {
    findById: vi.fn(),
    findByUser: vi.fn(),
    findByUserAndWhiskey: vi.fn(),
    findFeed: vi.fn(),
    getStatsByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../repositories/WhiskeyRepository", () => ({
  whiskeyRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("../repositories/UserRepository", () => ({
  userRepository: {
    findById: vi.fn(),
    filterActiveIds: vi.fn(),
  },
}));

vi.mock("../repositories/FollowRepository", () => ({
  followRepository: {
    getFollowingIds: vi.fn(),
  },
}));

// Deleting a note triggers the like/comment/notification cleanup — here we only
// check that it is called; its behaviour is tested in InteractionService.test.ts.
vi.mock("./InteractionService", () => ({
  interactionService: {
    getInteractionsFor: vi.fn().mockResolvedValue(new Map()),
    getInteractionsForNote: vi
      .fn()
      .mockResolvedValue({ likeCount: 0, commentCount: 0, isLikedByViewer: false }),
    removeNoteInteractions: vi.fn().mockResolvedValue(undefined),
  },
}));

const { tastingNoteService } = await import("./TastingNoteService");
const { tastingNoteRepository } = await import("../repositories/TastingNoteRepository");
const { whiskeyRepository } = await import("../repositories/WhiskeyRepository");
const { userRepository } = await import("../repositories/UserRepository");
const { followRepository } = await import("../repositories/FollowRepository");
const { interactionService } = await import("./InteractionService");

const OWNER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const OTHER_USER_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const NOTE_ID = "cccccccccccccccccccccccc";
const WHISKEY_ID = "dddddddddddddddddddddddd";

/** A sample note document as the repository would return it. */
function buildNote(overrides: Record<string, unknown> = {}) {
  return {
    _id: NOTE_ID,
    user: OWNER_ID,
    whiskey: WHISKEY_ID,
    tastingDate: new Date("2026-07-01"),
    rating: 88,
    noseTags: ["Bal (Honey)"],
    palateTags: [],
    finishTags: [],
    finishLength: "medium",
    visibility: "private",
    isFavorite: false,
    createdAt: new Date("2026-07-01"),
    updatedAt: new Date("2026-07-01"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getNoteForUser — the ownership check", () => {
  it("returns the note to its owner", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    const note = await tastingNoteService.getNoteForUser(NOTE_ID, OWNER_ID);

    expect(note.id).toBe(NOTE_ID);
    expect(note.userId).toBe(OWNER_ID);
  });

  it("refuses access to another user's note", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    await expect(tastingNoteService.getNoteForUser(NOTE_ID, OTHER_USER_ID)).rejects.toThrow(
      ForbiddenError
    );
  });

  it("throws NotFound for a note that does not exist", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(null);

    await expect(tastingNoteService.getNoteForUser(NOTE_ID, OWNER_ID)).rejects.toThrow(
      NotFoundError
    );
  });

  it("throws NotFound for an invalid ObjectId without hitting the database", async () => {
    await expect(tastingNoteService.getNoteForUser("gecersiz-id", OWNER_ID)).rejects.toThrow(
      NotFoundError
    );

    expect(tastingNoteRepository.findById).not.toHaveBeenCalled();
  });
});

describe("updateNote — the ownership check", () => {
  it("refuses to update another user's note", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    await expect(
      tastingNoteService.updateNote(NOTE_ID, OTHER_USER_ID, { rating: 10 })
    ).rejects.toThrow(ForbiddenError);

    expect(tastingNoteRepository.update).not.toHaveBeenCalled();
  });

  it("applies the update for the owner", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(tastingNoteRepository.update).mockResolvedValue(
      buildNote({ rating: 95 }) as never
    );

    const updated = await tastingNoteService.updateNote(NOTE_ID, OWNER_ID, { rating: 95 });

    expect(updated.rating).toBe(95);
    expect(tastingNoteRepository.update).toHaveBeenCalledOnce();
  });

  it("rejects an invalid score", async () => {
    await expect(
      tastingNoteService.updateNote(NOTE_ID, OWNER_ID, { rating: 150 })
    ).rejects.toThrow(ValidationError);
  });
});

describe("deleteNote — the ownership check", () => {
  it("refuses to delete another user's note", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    await expect(tastingNoteService.deleteNote(NOTE_ID, OTHER_USER_ID)).rejects.toThrow(
      ForbiddenError
    );

    expect(tastingNoteRepository.delete).not.toHaveBeenCalled();
  });

  it("performs the deletion for the owner", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(tastingNoteRepository.delete).mockResolvedValue(true);

    await tastingNoteService.deleteNote(NOTE_ID, OWNER_ID);

    expect(tastingNoteRepository.delete).toHaveBeenCalledWith(NOTE_ID);
  });

  it("clears the deleted note's likes, comments and notifications", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(tastingNoteRepository.delete).mockResolvedValue(true);

    await tastingNoteService.deleteNote(NOTE_ID, OWNER_ID);

    expect(interactionService.removeNoteInteractions).toHaveBeenCalledWith(NOTE_ID);
  });

  it("does not clear the interactions when the deletion fails", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(tastingNoteRepository.delete).mockResolvedValue(false);

    await expect(tastingNoteService.deleteNote(NOTE_ID, OWNER_ID)).rejects.toThrow(NotFoundError);

    expect(interactionService.removeNoteInteractions).not.toHaveBeenCalled();
  });
});

describe("createNote", () => {
  it("refuses to write a note against a whisky not in the catalogue", async () => {
    vi.mocked(whiskeyRepository.findById).mockResolvedValue(null);

    await expect(
      tastingNoteService.createNote(OWNER_ID, {
        whiskey: WHISKEY_ID,
        tastingDate: "2026-07-01",
        rating: 80,
        finishLength: "medium",
      })
    ).rejects.toThrow(NotFoundError);

    expect(tastingNoteRepository.create).not.toHaveBeenCalled();
  });

  it("attaches the note to the signed-in user", async () => {
    vi.mocked(whiskeyRepository.findById).mockResolvedValue({ _id: WHISKEY_ID } as never);
    vi.mocked(tastingNoteRepository.create).mockResolvedValue(buildNote() as never);

    await tastingNoteService.createNote(OWNER_ID, {
      whiskey: WHISKEY_ID,
      tastingDate: "2026-07-01",
      rating: 80,
      finishLength: "medium",
    });

    expect(tastingNoteRepository.create).toHaveBeenCalledWith(OWNER_ID, expect.anything());
  });

  it("rejects missing required fields", async () => {
    await expect(
      tastingNoteService.createNote(OWNER_ID, { rating: 80 })
    ).rejects.toThrow(ValidationError);
  });
});

describe("the visibility of closed accounts", () => {
  it("the feed asks only for notes by authors whose accounts are open", async () => {
    // The follow records stay; the filtering happens on the author ids, so
    // findFeed does not need a join.
    vi.mocked(followRepository.getFollowingIds).mockResolvedValue([
      OWNER_ID,
      OTHER_USER_ID,
    ] as never);
    vi.mocked(userRepository.filterActiveIds).mockResolvedValue([OWNER_ID] as never);
    vi.mocked(tastingNoteRepository.findFeed).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    } as never);

    await tastingNoteService.getFeed(OTHER_USER_ID);

    expect(tastingNoteRepository.findFeed).toHaveBeenCalledWith([OWNER_ID], undefined);
  });

  it("a public note cannot be found once its author closes their account", async () => {
    // findById applies the active filter, so a closed author comes back null.
    // The note must not stay readable through the permalink as the writing of a
    // hidden profile.
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(
      buildNote({ visibility: "public" }) as never
    );
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(tastingNoteService.getPublicNote(NOTE_ID)).rejects.toThrow(NotFoundError);
  });
});
