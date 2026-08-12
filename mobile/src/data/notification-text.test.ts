import { describe, it, expect } from "vitest";
import {
  notificationMessage,
  notificationRoute,
  type AppNotification,
  type NotificationType,
} from "./notification-text";
import { en, tr } from "../i18n/dictionaries";

function notification(
  type: NotificationType,
  extra: Partial<AppNotification> = {}
): AppNotification {
  return {
    id: "n1",
    type,
    actor: { id: "u1", name: "Emre" },
    isRead: false,
    createdAt: "2026-08-12T10:00:00.000Z",
    ...extra,
  };
}

describe("notificationMessage", () => {
  it("has NO target on a follow notification", () => {
    // "started following you" contains no {target} placeholder.
    expect(notificationMessage(notification("follow"))).toEqual({ key: "notifications.follow" });
  });

  it("uses the named target when the whisky name is known", () => {
    const result = notificationMessage(
      notification("like", { whiskeyLabel: "Lagavulin 16", tastingNoteId: "n9" })
    );

    expect(result).toEqual({
      key: "notifications.like",
      targetKey: "notifications.targetNamed",
      whiskeyLabel: "Lagavulin 16",
    });
  });

  it("falls back to the generic target without a whisky name", () => {
    expect(notificationMessage(notification("comment", { tastingNoteId: "n9" }))).toEqual({
      key: "notifications.comment",
      targetKey: "notifications.targetGeneric",
    });
  });

  it("emits only keys that actually exist in the dictionaries", () => {
    // A missing key makes t() return the key itself, and the screen ends up
    // reading "notifications.like".
    for (const type of ["follow", "like", "comment"] as NotificationType[]) {
      const message = notificationMessage(notification(type, { whiskeyLabel: "X" }));
      expect(tr[message.key]).toBeTruthy();
      expect(en[message.key]).toBeTruthy();
      if (message.targetKey) {
        expect(tr[message.targetKey]).toBeTruthy();
        expect(en[message.targetKey]).toBeTruthy();
      }
    }
  });
});

describe("notificationRoute", () => {
  it("sends a follow notification to the actor's profile", () => {
    expect(notificationRoute(notification("follow"))).toBe("/(app)/feed/user/u1");
  });

  it("sends likes and comments to the note", () => {
    expect(notificationRoute(notification("like", { tastingNoteId: "n9" }))).toBe(
      "/(app)/feed/note/n9"
    );
    expect(notificationRoute(notification("comment", { tastingNoteId: "n9" }))).toBe(
      "/(app)/feed/note/n9"
    );
  });

  it("falls back to the profile when the note id is missing", () => {
    // A notification can outlive its note; better to land on the actor's
    // profile than on an empty screen.
    expect(notificationRoute(notification("like"))).toBe("/(app)/feed/user/u1");
  });
});
