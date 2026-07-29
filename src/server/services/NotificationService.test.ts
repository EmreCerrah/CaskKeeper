/**
 * NotificationService testleri.
 *
 * Odak: kendine bildirim üretilmemesi, bildirim üretiminin asıl işlemi
 * bozmaması ve bir bildirimin yalnızca alıcısı tarafından okunabilmesi.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundError } from "@/lib/errors";

vi.mock("../repositories/NotificationRepository", () => ({
  notificationRepository: {
    create: vi.fn(),
    findByRecipient: vi.fn(),
    countUnread: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    deleteByAction: vi.fn(),
  },
}));

const { notificationService } = await import("./NotificationService");
const { notificationRepository } = await import("../repositories/NotificationRepository");

const RECIPIENT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const ACTOR_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const NOTIFICATION_ID = "cccccccccccccccccccccccc";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("notify", () => {
  it("bildirimi oluşturur", async () => {
    await notificationService.notify({
      recipientId: RECIPIENT_ID,
      actorId: ACTOR_ID,
      type: "follow",
    });

    expect(notificationRepository.create).toHaveBeenCalledOnce();
  });

  it("kullanıcının kendi eylemi için bildirim üretmez", async () => {
    await notificationService.notify({
      recipientId: ACTOR_ID,
      actorId: ACTOR_ID,
      type: "like",
    });

    expect(notificationRepository.create).not.toHaveBeenCalled();
  });

  it("bildirim kaydı başarısız olsa da hata fırlatmaz", async () => {
    vi.mocked(notificationRepository.create).mockRejectedValue(new Error("db down"));

    await expect(
      notificationService.notify({
        recipientId: RECIPIENT_ID,
        actorId: ACTOR_ID,
        type: "comment",
      })
    ).resolves.toBeUndefined();
  });
});

describe("revoke", () => {
  it("geri alınan eylemin bildirimini siler", async () => {
    await notificationService.revoke({
      recipientId: RECIPIENT_ID,
      actorId: ACTOR_ID,
      type: "follow",
    });

    expect(notificationRepository.deleteByAction).toHaveBeenCalledWith(
      expect.objectContaining({ recipientId: RECIPIENT_ID, actorId: ACTOR_ID, type: "follow" })
    );
  });

  it("silme başarısız olsa da hata fırlatmaz", async () => {
    vi.mocked(notificationRepository.deleteByAction).mockRejectedValue(new Error("db down"));

    await expect(
      notificationService.revoke({
        recipientId: RECIPIENT_ID,
        actorId: ACTOR_ID,
        type: "like",
      })
    ).resolves.toBeUndefined();
  });
});

describe("markRead — sahiplik kontrolü", () => {
  it("alıcısı için okundu işaretler", async () => {
    vi.mocked(notificationRepository.markRead).mockResolvedValue(true);

    await notificationService.markRead(NOTIFICATION_ID, RECIPIENT_ID);

    expect(notificationRepository.markRead).toHaveBeenCalledWith(NOTIFICATION_ID, RECIPIENT_ID);
  });

  it("başkasının bildirimi için NotFound fırlatır", async () => {
    // Repository sorgusu recipient ile kısıtlıdır; eşleşme yoksa false döner
    vi.mocked(notificationRepository.markRead).mockResolvedValue(false);

    await expect(
      notificationService.markRead(NOTIFICATION_ID, ACTOR_ID)
    ).rejects.toThrow(NotFoundError);
  });

  it("geçersiz ObjectId için veritabanına gitmeden NotFound fırlatır", async () => {
    await expect(
      notificationService.markRead("gecersiz-id", RECIPIENT_ID)
    ).rejects.toThrow(NotFoundError);

    expect(notificationRepository.markRead).not.toHaveBeenCalled();
  });
});

describe("list", () => {
  it("bildirimleri okunmamış sayısıyla birlikte döndürür", async () => {
    vi.mocked(notificationRepository.findByRecipient).mockResolvedValue({
      data: [
        {
          _id: NOTIFICATION_ID,
          recipient: RECIPIENT_ID,
          actor: { _id: ACTOR_ID, name: "Deniz" },
          type: "follow",
          isRead: false,
          createdAt: new Date("2026-07-20"),
          updatedAt: new Date("2026-07-20"),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    } as never);
    vi.mocked(notificationRepository.countUnread).mockResolvedValue(1);

    const result = await notificationService.list(RECIPIENT_ID);

    expect(result.unreadCount).toBe(1);
    expect(result.data[0].actor.name).toBe("Deniz");
    expect(result.data[0].type).toBe("follow");
    expect(result.data[0].isRead).toBe(false);
  });
});
