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
  it("takip bildiriminde hedef YOK", () => {
    // "sizi takip etmeye başladı" cümlesinde {target} yer tutucusu yok.
    expect(notificationMessage(notification("follow"))).toEqual({ key: "notifications.follow" });
  });

  it("viski adı biliniyorsa adlı hedefi kullanır", () => {
    const result = notificationMessage(
      notification("like", { whiskeyLabel: "Lagavulin 16", tastingNoteId: "n9" })
    );

    expect(result).toEqual({
      key: "notifications.like",
      targetKey: "notifications.targetNamed",
      whiskeyLabel: "Lagavulin 16",
    });
  });

  it("viski adı yoksa genel hedefe düşer", () => {
    expect(notificationMessage(notification("comment", { tastingNoteId: "n9" }))).toEqual({
      key: "notifications.comment",
      targetKey: "notifications.targetGeneric",
    });
  });

  it("ürettiği her anahtar sözlükte gerçekten var", () => {
    // Anahtar bulunamazsa t() anahtarın kendisini döndürür ve ekranda
    // "notifications.like" yazar.
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
  it("takip bildirimi aktörün profiline gider", () => {
    expect(notificationRoute(notification("follow"))).toBe("/(app)/feed/user/u1");
  });

  it("beğeni ve yorum nota gider", () => {
    expect(notificationRoute(notification("like", { tastingNoteId: "n9" }))).toBe(
      "/(app)/feed/note/n9"
    );
    expect(notificationRoute(notification("comment", { tastingNoteId: "n9" }))).toBe(
      "/(app)/feed/note/n9"
    );
  });

  it("not kimliği eksikse profile düşer", () => {
    // Not silinmişse bildirim ortada kalabiliyor; boş ekrana götürmektense
    // aktörün profiline götürmek yeğ.
    expect(notificationRoute(notification("like"))).toBe("/(app)/feed/user/u1");
  });
});
