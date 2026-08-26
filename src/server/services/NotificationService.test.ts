/**
 * NotificationService tests.
 *
 * Focus: never notifying yourself, notification creation never breaking the
 * action behind it, and a notification being readable only by its recipient.
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
  it("creates the notification", async () => {
    await notificationService.notify({
      recipientId: RECIPIENT_ID,
      actorId: ACTOR_ID,
      type: "follow",
    });

    expect(notificationRepository.create).toHaveBeenCalledOnce();
  });

  it("produces no notification for a user's own action", async () => {
    await notificationService.notify({
      recipientId: ACTOR_ID,
      actorId: ACTOR_ID,
      type: "like",
    });

    expect(notificationRepository.create).not.toHaveBeenCalled();
  });

  it("does not throw even when saving the notification fails", async () => {
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
  it("deletes the notification for an undone action", async () => {
    await notificationService.revoke({
      recipientId: RECIPIENT_ID,
      actorId: ACTOR_ID,
      type: "follow",
    });

    expect(notificationRepository.deleteByAction).toHaveBeenCalledWith(
      expect.objectContaining({ recipientId: RECIPIENT_ID, actorId: ACTOR_ID, type: "follow" })
    );
  });

  it("does not throw even when the deletion fails", async () => {
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

describe("markRead — the ownership check", () => {
  it("marks it read for its recipient", async () => {
    vi.mocked(notificationRepository.markRead).mockResolvedValue(true);

    await notificationService.markRead(NOTIFICATION_ID, RECIPIENT_ID);

    expect(notificationRepository.markRead).toHaveBeenCalledWith(NOTIFICATION_ID, RECIPIENT_ID);
  });

  it("throws NotFound for somebody else's notification", async () => {
    // The repository query is scoped to the recipient; no match returns false
    vi.mocked(notificationRepository.markRead).mockResolvedValue(false);

    await expect(
      notificationService.markRead(NOTIFICATION_ID, ACTOR_ID)
    ).rejects.toThrow(NotFoundError);
  });

  it("throws NotFound for an invalid ObjectId without hitting the database", async () => {
    await expect(
      notificationService.markRead("gecersiz-id", RECIPIENT_ID)
    ).rejects.toThrow(NotFoundError);

    expect(notificationRepository.markRead).not.toHaveBeenCalled();
  });
});

describe("list", () => {
  it("returns the notifications together with the unread count", async () => {
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
