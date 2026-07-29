/**
 * TastingNoteService testleri.
 *
 * Odak: sahiplik kontrolü — bir kullanıcının notu başkasına sızmamalı,
 * başkası tarafından değiştirilememeli veya silinememeli. Repository
 * katmanı mock'lanır; veritabanı bağlantısı kurulmaz.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

vi.mock("../repositories/TastingNoteRepository", () => ({
  tastingNoteRepository: {
    findById: vi.fn(),
    findByUser: vi.fn(),
    findByUserAndWhiskey: vi.fn(),
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

// Not silindiğinde beğeni/yorum/bildirim temizliği çağrılır — burada
// yalnızca çağrıldığı doğrulanır, davranışı InteractionService.test.ts'de test edilir.
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
const { interactionService } = await import("./InteractionService");

const OWNER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const OTHER_USER_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const NOTE_ID = "cccccccccccccccccccccccc";
const WHISKEY_ID = "dddddddddddddddddddddddd";

/** Repository'den dönecek örnek not dokümanı */
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

describe("getNoteForUser — sahiplik kontrolü", () => {
  it("not sahibine notu döndürür", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    const note = await tastingNoteService.getNoteForUser(NOTE_ID, OWNER_ID);

    expect(note.id).toBe(NOTE_ID);
    expect(note.userId).toBe(OWNER_ID);
  });

  it("başka kullanıcının notuna erişimi reddeder", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    await expect(tastingNoteService.getNoteForUser(NOTE_ID, OTHER_USER_ID)).rejects.toThrow(
      ForbiddenError
    );
  });

  it("olmayan not için NotFound fırlatır", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(null);

    await expect(tastingNoteService.getNoteForUser(NOTE_ID, OWNER_ID)).rejects.toThrow(
      NotFoundError
    );
  });

  it("geçersiz ObjectId için veritabanına gitmeden NotFound fırlatır", async () => {
    await expect(tastingNoteService.getNoteForUser("gecersiz-id", OWNER_ID)).rejects.toThrow(
      NotFoundError
    );

    expect(tastingNoteRepository.findById).not.toHaveBeenCalled();
  });
});

describe("updateNote — sahiplik kontrolü", () => {
  it("başka kullanıcının notunu güncellemeyi reddeder", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    await expect(
      tastingNoteService.updateNote(NOTE_ID, OTHER_USER_ID, { rating: 10 })
    ).rejects.toThrow(ForbiddenError);

    expect(tastingNoteRepository.update).not.toHaveBeenCalled();
  });

  it("sahibi için güncellemeyi uygular", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(tastingNoteRepository.update).mockResolvedValue(
      buildNote({ rating: 95 }) as never
    );

    const updated = await tastingNoteService.updateNote(NOTE_ID, OWNER_ID, { rating: 95 });

    expect(updated.rating).toBe(95);
    expect(tastingNoteRepository.update).toHaveBeenCalledOnce();
  });

  it("geçersiz puanı reddeder", async () => {
    await expect(
      tastingNoteService.updateNote(NOTE_ID, OWNER_ID, { rating: 150 })
    ).rejects.toThrow(ValidationError);
  });
});

describe("deleteNote — sahiplik kontrolü", () => {
  it("başka kullanıcının notunu silmeyi reddeder", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);

    await expect(tastingNoteService.deleteNote(NOTE_ID, OTHER_USER_ID)).rejects.toThrow(
      ForbiddenError
    );

    expect(tastingNoteRepository.delete).not.toHaveBeenCalled();
  });

  it("sahibi için silme işlemini yapar", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(tastingNoteRepository.delete).mockResolvedValue(true);

    await tastingNoteService.deleteNote(NOTE_ID, OWNER_ID);

    expect(tastingNoteRepository.delete).toHaveBeenCalledWith(NOTE_ID);
  });

  it("silinen notun beğeni, yorum ve bildirimlerini temizler", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(tastingNoteRepository.delete).mockResolvedValue(true);

    await tastingNoteService.deleteNote(NOTE_ID, OWNER_ID);

    expect(interactionService.removeNoteInteractions).toHaveBeenCalledWith(NOTE_ID);
  });

  it("silme başarısız olursa etkileşimleri temizlemez", async () => {
    vi.mocked(tastingNoteRepository.findById).mockResolvedValue(buildNote() as never);
    vi.mocked(tastingNoteRepository.delete).mockResolvedValue(false);

    await expect(tastingNoteService.deleteNote(NOTE_ID, OWNER_ID)).rejects.toThrow(NotFoundError);

    expect(interactionService.removeNoteInteractions).not.toHaveBeenCalled();
  });
});

describe("createNote", () => {
  it("katalogda olmayan viskiye not yazmayı reddeder", async () => {
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

  it("notu oturumdaki kullanıcıya bağlar", async () => {
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

  it("eksik zorunlu alanları reddeder", async () => {
    await expect(
      tastingNoteService.createNote(OWNER_ID, { rating: 80 })
    ).rejects.toThrow(ValidationError);
  });
});
