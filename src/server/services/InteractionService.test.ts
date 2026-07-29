/**
 * InteractionService testleri.
 *
 * Odak: etkileşimin yalnızca herkese açık notlara verilebilmesi, yorum silme
 * yetkisi ve kendi eylemi için bildirim üretilmemesi. Repository katmanı
 * mock'lanır; veritabanı bağlantısı kurulmaz.
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
    body: "Harika bir tadım notu.",
    createdAt: new Date("2026-07-02"),
    updatedAt: new Date("2026-07-02"),
    ...overrides,
  };
}

/** Etkileşim özeti sorguları her testte çağrılır; nötr varsayılan verelim. */
function stubInteractionSummary() {
  vi.mocked(likeRepository.countByNotes).mockResolvedValue(new Map());
  vi.mocked(commentRepository.countByNotes).mockResolvedValue(new Map());
  vi.mocked(likeRepository.findLikedNoteIds).mockResolvedValue(new Set());
}

beforeEach(() => {
  vi.clearAllMocks();
  stubInteractionSummary();
});

describe("like — görünürlük kuralı", () => {
  it("herkese açık notu beğenir ve sahibine bildirim üretir", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(likeRepository.create).mockResolvedValue(true);

    await interactionService.like(VIEWER_ID, NOTE_ID);

    expect(likeRepository.create).toHaveBeenCalledWith(VIEWER_ID, NOTE_ID);
    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ recipientId: AUTHOR_ID, actorId: VIEWER_ID, type: "like" })
    );
  });

  it("özel notu beğenmeyi NotFound ile reddeder", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(
      buildNote({ visibility: "private" }) as never
    );

    await expect(interactionService.like(VIEWER_ID, NOTE_ID)).rejects.toThrow(NotFoundError);

    expect(likeRepository.create).not.toHaveBeenCalled();
  });

  it("geçersiz ObjectId için veritabanına gitmeden NotFound fırlatır", async () => {
    await expect(interactionService.like(VIEWER_ID, "gecersiz-id")).rejects.toThrow(NotFoundError);

    expect(tastingNoteRepository.findById).not.toHaveBeenCalled();
  });

  it("kendi notunu beğenende bildirim üretmez", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(likeRepository.create).mockResolvedValue(true);

    await interactionService.like(AUTHOR_ID, NOTE_ID);

    expect(likeRepository.create).toHaveBeenCalled();
    expect(notificationRepository.create).not.toHaveBeenCalled();
  });

  it("zaten beğenilmiş notta ikinci bildirim üretmez", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(likeRepository.create).mockResolvedValue(false);

    await interactionService.like(VIEWER_ID, NOTE_ID);

    expect(notificationRepository.create).not.toHaveBeenCalled();
  });
});

describe("unlike", () => {
  it("beğeni kalkınca bildirimi de siler", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(likeRepository.delete).mockResolvedValue(true);

    await interactionService.unlike(VIEWER_ID, NOTE_ID);

    expect(notificationRepository.deleteByAction).toHaveBeenCalledWith(
      expect.objectContaining({ recipientId: AUTHOR_ID, actorId: VIEWER_ID, type: "like" })
    );
  });

  it("beğeni yoksa bildirim silmeye kalkmaz", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(likeRepository.delete).mockResolvedValue(false);

    await interactionService.unlike(VIEWER_ID, NOTE_ID);

    expect(notificationRepository.deleteByAction).not.toHaveBeenCalled();
  });
});

describe("addComment", () => {
  it("özel nota yorum yazmayı reddeder", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(
      buildNote({ visibility: "private" }) as never
    );

    await expect(
      interactionService.addComment(VIEWER_ID, NOTE_ID, { body: "Merhaba" })
    ).rejects.toThrow(NotFoundError);

    expect(commentRepository.create).not.toHaveBeenCalled();
  });

  it("boş yorumu reddeder", async () => {
    await expect(
      interactionService.addComment(VIEWER_ID, NOTE_ID, { body: "   " })
    ).rejects.toThrow(ValidationError);

    expect(tastingNoteRepository.findById).not.toHaveBeenCalled();
  });

  it("1000 karakteri aşan yorumu reddeder", async () => {
    await expect(
      interactionService.addComment(VIEWER_ID, NOTE_ID, { body: "a".repeat(1001) })
    ).rejects.toThrow(ValidationError);
  });

  it("yorumu kaydeder ve not sahibine bildirim üretir", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(commentRepository.create).mockResolvedValue(buildComment() as never);
    vi.mocked(commentRepository.findByNote).mockResolvedValue([buildComment()] as never);

    const comment = await interactionService.addComment(VIEWER_ID, NOTE_ID, {
      body: "Harika bir tadım notu.",
    });

    expect(comment.body).toBe("Harika bir tadım notu.");
    expect(commentRepository.create).toHaveBeenCalledWith(
      VIEWER_ID,
      NOTE_ID,
      "Harika bir tadım notu."
    );
    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ recipientId: AUTHOR_ID, actorId: VIEWER_ID, type: "comment" })
    );
  });
});

describe("deleteComment — yetki kontrolü", () => {
  it("yorumun yazarı silebilir", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(buildComment() as never);

    await interactionService.deleteComment(COMMENT_ID, VIEWER_ID);

    expect(commentRepository.delete).toHaveBeenCalledWith(COMMENT_ID);
    expect(notificationRepository.deleteByComment).toHaveBeenCalledWith(COMMENT_ID);
  });

  it("not sahibi kendi notundaki yorumu silebilir", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(buildComment() as never);
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    await interactionService.deleteComment(COMMENT_ID, AUTHOR_ID);

    expect(commentRepository.delete).toHaveBeenCalledWith(COMMENT_ID);
  });

  it("ilgisiz kullanıcının silmesini reddeder", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(buildComment() as never);
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    await expect(interactionService.deleteComment(COMMENT_ID, THIRD_USER_ID)).rejects.toThrow(
      ForbiddenError
    );

    expect(commentRepository.delete).not.toHaveBeenCalled();
  });

  it("olmayan yorum için NotFound fırlatır", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(null);

    await expect(interactionService.deleteComment(COMMENT_ID, VIEWER_ID)).rejects.toThrow(
      NotFoundError
    );
  });
});

describe("getComments — görünürlük ve silme yetkisi", () => {
  it("başkasının özel notunun yorumlarını göstermez", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(
      buildNote({ visibility: "private" }) as never
    );

    await expect(interactionService.getComments(NOTE_ID, VIEWER_ID)).rejects.toThrow(NotFoundError);
  });

  it("kendi özel notunun yorumlarını sahibine gösterir", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(
      buildNote({ visibility: "private" }) as never
    );
    vi.mocked(commentRepository.findByNote).mockResolvedValue([] as never);

    await expect(interactionService.getComments(NOTE_ID, AUTHOR_ID)).resolves.toEqual([]);
  });

  it("not sahibine tüm yorumlar için silme yetkisi verir", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(commentRepository.findByNote).mockResolvedValue([buildComment()] as never);

    const [comment] = await interactionService.getComments(NOTE_ID, AUTHOR_ID);

    expect(comment.canDelete).toBe(true);
  });

  it("oturumsuz görüntüleyene silme yetkisi vermez", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(commentRepository.findByNote).mockResolvedValue([buildComment()] as never);

    const [comment] = await interactionService.getComments(NOTE_ID);

    expect(comment.canDelete).toBe(false);
  });

  it("ilgisiz kullanıcıya başkasının yorumu için silme yetkisi vermez", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(commentRepository.findByNote).mockResolvedValue([buildComment()] as never);

    const [comment] = await interactionService.getComments(NOTE_ID, THIRD_USER_ID);

    expect(comment.canDelete).toBe(false);
  });
});

describe("getInteractionsFor — toplu özet", () => {
  it("tek turda sayıları eşler, eksik notlara sıfır verir", async () => {
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

    // Not başına ayrı sorgu atılmamalı
    expect(likeRepository.countByNotes).toHaveBeenCalledOnce();
    expect(commentRepository.countByNotes).toHaveBeenCalledOnce();
  });

  it("oturumsuz görüntüleyende beğeni sorgusu atmaz", async () => {
    await interactionService.getInteractionsFor([NOTE_ID]);

    expect(likeRepository.findLikedNoteIds).not.toHaveBeenCalled();
  });

  it("boş listede hiç sorgu atmaz", async () => {
    const summary = await interactionService.getInteractionsFor([], VIEWER_ID);

    expect(summary.size).toBe(0);
    expect(likeRepository.countByNotes).not.toHaveBeenCalled();
  });
});
