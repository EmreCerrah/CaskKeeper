import { describe, it, expect } from "vitest";
import { markAllReadInList, markReadInList, type NotificationList } from "./notification-cache";
import type { AppNotification } from "./notification-text";

function item(id: string, isRead: boolean): AppNotification {
  return {
    id,
    type: "like",
    actor: { id: "u1", name: "Emre" },
    isRead,
    createdAt: "2026-08-12T10:00:00.000Z",
    tastingNoteId: "n9",
  };
}

function list(): NotificationList {
  return {
    data: [item("a", false), item("b", true), item("c", false)],
    total: 3,
    page: 1,
    limit: 20,
    totalPages: 1,
    unreadCount: 2,
  };
}

describe("markReadInList", () => {
  it("satırı okunmuş yapar ve sayacı bir azaltır", () => {
    const result = markReadInList(list(), "a");

    expect(result?.data.map((i) => i.isRead)).toEqual([true, true, false]);
    expect(result?.unreadCount).toBe(1);
  });

  it("zaten okunmuş satır sayacı düşürmez", () => {
    // Aynı satıra ikinci kez dokunmak rozeti olduğundan düşük göstermemeli.
    const cached = list();
    const result = markReadInList(cached, "b");

    expect(result).toBe(cached);
    expect(result?.unreadCount).toBe(2);
  });

  it("listede olmayan bildirim için hiçbir şeyi değiştirmez", () => {
    const cached = list();
    expect(markReadInList(cached, "yok")).toBe(cached);
  });

  it("sayaç sıfırın altına inmez", () => {
    const cached: NotificationList = { ...list(), unreadCount: 0 };
    expect(markReadInList(cached, "a")?.unreadCount).toBe(0);
  });

  it("önbellek boşsa çökmez", () => {
    expect(markReadInList(undefined, "a")).toBeUndefined();
  });

  it("girdiyi değiştirmez", () => {
    const cached = list();
    markReadInList(cached, "a");
    expect(cached.data[0].isRead).toBe(false);
    expect(cached.unreadCount).toBe(2);
  });
});

describe("markAllReadInList", () => {
  it("hepsini okunmuş yapar ve sayacı sıfırlar", () => {
    const result = markAllReadInList(list());

    expect(result?.data.every((i) => i.isRead)).toBe(true);
    expect(result?.unreadCount).toBe(0);
  });

  it("sayaç görünen satır sayısına göre değil, sıfıra çekilir", () => {
    // Sunucu TÜM bildirimleri işaretliyor; liste yalnızca ilk sayfayı taşıyor.
    const cached: NotificationList = { ...list(), total: 57, totalPages: 3, unreadCount: 40 };
    expect(markAllReadInList(cached)?.unreadCount).toBe(0);
  });

  it("liste boşken de çalışır, önbellek yokken çökmez", () => {
    const empty: NotificationList = { ...list(), data: [], unreadCount: 0 };
    expect(markAllReadInList(empty)?.data).toEqual([]);
    expect(markAllReadInList(undefined)).toBeUndefined();
  });
});
