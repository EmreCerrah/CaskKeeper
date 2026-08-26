/**
 * InteractionService tests.
 *
 * Focus: interaction being possible only with public notes, who may delete a
 * comment, and no notification being produced for your own action. The
 * repository layer is mocked; no database connection is opened.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

vi.mock("../repositories/TastingNoteRepository", () => ({
  tastingNoteRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("../repositories/LikeRepository", () => ({
  likeRepository: {
    create: vi.fn(),
    delete: vi.fn(),
    countByNotes: vi.fn(),
    findLikedNoteIds: vi.fn(),
    deleteByNote: vi.fn(),
  },
}));

vi.mock("../repositories/CommentRepository", () => ({
  commentRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByNote: vi.fn(),
    countByNotes: vi.fn(),
    delete: vi.fn(),
    deleteByNote: vi.fn(),
  },
}));

vi.mock("../repositories/NotificationRepository", () => ({
  notificationRepository: {
    create: vi.fn(),
    deleteByAction: vi.fn(),
    deleteByComment: vi.fn(),
    deleteByNote: vi.fn(),
  },
}));

const { interactionService } = await import("./InteractionService");
const { tastingNoteRepository } = await import("../repositories/TastingNoteRepository");
const { likeRepository } = await import("../repositories/LikeRepository");
const { commentRepository } = await import("../repositories/CommentRepository");
const { notificationRepository } = await import("../repositories/NotificationRepository");

const AUTHOR_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const VIEWER_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const NOTE_ID = "cccccccccccccccccccccccc";
const COMMENT_ID = "dddddddddddddddddddddddd";
const THIRD_USER_ID = "eeeeeeeeeeeeeeeeeeeeeeee";

function buildNote(overrides: Record<string, unknown> = {}) {
  return {
    _id: NOTE_ID,
    user: AUTHOR_ID,
    whiskey: "ffffffffffffffffffffffff",
    tastingDate: new Date("2026-07-01"),
    rating: 90,
    noseTags: [],
    palateTags: [],
    finishTags: [],
    finishLength: "medium",
    visibility: "public",
    isFavorite: false,
    createdAt: new Date("2026-07-01"),
    updatedAt: new Date("2026-07-01"),
    ...overrides,
  };
}

function buildComment(overrides: Record<string, unknown> = {}) {
  return {
    _id: COMMENT_ID,
    user: VIEWER_ID,
    tastingNote: NOTE_ID,
    body: "A great tasting note.",
    createdAt: new Date("2026-07-02"),
    updatedAt: new Date("2026-07-02"),
    ...overrides,
  };
}

/** The interaction summary queries run in every test; give them a neutral default. */
function stubInteractionSummary() {
  vi.mocked(likeRepository.countByNotes).mockResolvedValue(new Map());
  vi.mocked(commentRepository.countByNotes).mockResolvedValue(new Map());
  vi.mocked(likeRepository.findLikedNoteIds).mockResolvedValue(new Set());
}

beforeEach(() => {
  vi.clearAllMocks();
  stubInteractionSummary();
});

describe("like — the visibility rule", () => {
  it("likes a public note and notifies its owner", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(likeRepository.create).mockResolvedValue(true);

    await interactionService.like(VIEWER_ID, NOTE_ID);

    expect(likeRepository.create).toHaveBeenCalledWith(VIEWER_ID, NOTE_ID);
    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ recipientId: AUTHOR_ID, actorId: VIEWER_ID, type: "like" })
    );
  });

  it("refuses to like a private note, with NotFound", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(
      buildNote({ visibility: "private" }) as never
    );

    await expect(interactionService.like(VIEWER_ID, NOTE_ID)).rejects.toThrow(NotFoundError);

    expect(likeRepository.create).not.toHaveBeenCalled();
  });

  it("throws NotFound for an invalid ObjectId without hitting the database", async () => {
    await expect(interactionService.like(VIEWER_ID, "gecersiz-id")).rejects.toThrow(NotFoundError);

    expect(tastingNoteRepository.findById).not.toHaveBeenCalled();
  });

  it("produces no notification when someone likes their own note", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(likeRepository.create).mockResolvedValue(true);

    await interactionService.like(AUTHOR_ID, NOTE_ID);

    expect(likeRepository.create).toHaveBeenCalled();
    expect(notificationRepository.create).not.toHaveBeenCalled();
  });

  it("produces no second notification on an already-liked note", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(likeRepository.create).mockResolvedValue(false);

    await interactionService.like(VIEWER_ID, NOTE_ID);

    expect(notificationRepository.create).not.toHaveBeenCalled();
  });
});

describe("unlike", () => {
  it("deletes the notification when the like is removed", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(likeRepository.delete).mockResolvedValue(true);

    await interactionService.unlike(VIEWER_ID, NOTE_ID);

    expect(notificationRepository.deleteByAction).toHaveBeenCalledWith(
      expect.objectContaining({ recipientId: AUTHOR_ID, actorId: VIEWER_ID, type: "like" })
    );
  });

  it("does not try to delete a notification when there was no like", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(likeRepository.delete).mockResolvedValue(false);

    await interactionService.unlike(VIEWER_ID, NOTE_ID);

    expect(notificationRepository.deleteByAction).not.toHaveBeenCalled();
  });
});

describe("addComment", () => {
  it("refuses to comment on a private note", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(
      buildNote({ visibility: "private" }) as never
    );

    await expect(
      interactionService.addComment(VIEWER_ID, NOTE_ID, { body: "Merhaba" })
    ).rejects.toThrow(NotFoundError);

    expect(commentRepository.create).not.toHaveBeenCalled();
  });

  it("rejects an empty comment", async () => {
    await expect(
      interactionService.addComment(VIEWER_ID, NOTE_ID, { body: "   " })
    ).rejects.toThrow(ValidationError);

    expect(tastingNoteRepository.findById).not.toHaveBeenCalled();
  });

  it("rejects a comment longer than 1000 characters", async () => {
    await expect(
      interactionService.addComment(VIEWER_ID, NOTE_ID, { body: "a".repeat(1001) })
    ).rejects.toThrow(ValidationError);
  });

  it("saves the comment and notifies the note's owner", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(commentRepository.create).mockResolvedValue(buildComment() as never);
    vi.mocked(commentRepository.findByNote).mockResolvedValue([buildComment()] as never);

    const comment = await interactionService.addComment(VIEWER_ID, NOTE_ID, {
      body: "A great tasting note.",
    });

    expect(comment.body).toBe("A great tasting note.");
    expect(commentRepository.create).toHaveBeenCalledWith(
      VIEWER_ID,
      NOTE_ID,
      "A great tasting note."
    );
    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ recipientId: AUTHOR_ID, actorId: VIEWER_ID, type: "comment" })
    );
  });
});

describe("deleteComment — the permission check", () => {
  it("the comment's author may delete it", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(buildComment() as never);

    await interactionService.deleteComment(COMMENT_ID, VIEWER_ID);

    expect(commentRepository.delete).toHaveBeenCalledWith(COMMENT_ID);
    expect(notificationRepository.deleteByComment).toHaveBeenCalledWith(COMMENT_ID);
  });

  it("the note's owner may delete a comment on their note", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(buildComment() as never);
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    await interactionService.deleteComment(COMMENT_ID, AUTHOR_ID);

    expect(commentRepository.delete).toHaveBeenCalledWith(COMMENT_ID);
  });

  it("refuses deletion by an unrelated user", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(buildComment() as never);
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    await expect(interactionService.deleteComment(COMMENT_ID, THIRD_USER_ID)).rejects.toThrow(
      ForbiddenError
    );

    expect(commentRepository.delete).not.toHaveBeenCalled();
  });

  it("throws NotFound for a comment that does not exist", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(null);

    await expect(interactionService.deleteComment(COMMENT_ID, VIEWER_ID)).rejects.toThrow(
      NotFoundError
    );
  });
});

describe("getComments — visibility and deletion rights", () => {
  it("does not show the comments on somebody else's private note", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(
      buildNote({ visibility: "private" }) as never
    );

    await expect(interactionService.getComments(NOTE_ID, VIEWER_ID)).rejects.toThrow(NotFoundError);
  });

  it("shows the owner the comments on their own private note", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(
      buildNote({ visibility: "private" }) as never
    );
    vi.mocked(commentRepository.findByNote).mockResolvedValue([] as never);

    await expect(interactionService.getComments(NOTE_ID, AUTHOR_ID)).resolves.toEqual([]);
  });

  it("gives the note's owner deletion rights over every comment", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(commentRepository.findByNote).mockResolvedValue([buildComment()] as never);

    const [comment] = await interactionService.getComments(NOTE_ID, AUTHOR_ID);

    expect(comment.canDelete).toBe(true);
  });

  it("gives a signed-out viewer no deletion rights", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(commentRepository.findByNote).mockResolvedValue([buildComment()] as never);

    const [comment] = await interactionService.getComments(NOTE_ID);

    expect(comment.canDelete).toBe(false);
  });

  it("gives an unrelated user no deletion rights over somebody else's comment", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(commentRepository.findByNote).mockResolvedValue([buildComment()] as never);

    const [comment] = await interactionService.getComments(NOTE_ID, THIRD_USER_ID);

    expect(comment.canDelete).toBe(false);
  });
});

describe("getInteractionsFor — the bulk summary", () => {
  it("matches the counts in one pass and gives zero to notes with none", async () => {
    const OTHER_NOTE_ID = "111111111111111111111111";

    vi.mocked(likeRepository.countByNotes).mockResolvedValue(new Map([[NOTE_ID, 3]]));
    vi.mocked(commentRepository.countByNotes).mockResolvedValue(new Map([[NOTE_ID, 2]]));
    vi.mocked(likeRepository.findLikedNoteIds).mockResolvedValue(new Set([NOTE_ID]));

    const summary = await interactionService.getInteractionsFor(
      [NOTE_ID, OTHER_NOTE_ID],
      VIEWER_ID
    );

    expect(summary.get(NOTE_ID)).toEqual({
      likeCount: 3,
      commentCount: 2,
      isLikedByViewer: true,
    });
    expect(summary.get(OTHER_NOTE_ID)).toEqual({
      likeCount: 0,
      commentCount: 0,
      isLikedByViewer: false,
    });

    // No query should be fired per note
    expect(likeRepository.countByNotes).toHaveBeenCalledOnce();
    expect(commentRepository.countByNotes).toHaveBeenCalledOnce();
  });

  it("fires no like query for a signed-out viewer", async () => {
    await interactionService.getInteractionsFor([NOTE_ID]);

    expect(likeRepository.findLikedNoteIds).not.toHaveBeenCalled();
  });

  it("fires no query at all for an empty list", async () => {
    const summary = await interactionService.getInteractionsFor([], VIEWER_ID);

    expect(summary.size).toBe(0);
    expect(likeRepository.countByNotes).not.toHaveBeenCalled();
  });
});
