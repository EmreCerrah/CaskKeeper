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
  it("marks the row read and decrements the counter", () => {
    const result = markReadInList(list(), "a");

    expect(result?.data.map((i) => i.isRead)).toEqual([true, true, false]);
    expect(result?.unreadCount).toBe(1);
  });

  it("does not decrement for a row that was already read", () => {
    // Tapping the same row twice must not push the badge below the truth.
    const cached = list();
    const result = markReadInList(cached, "b");

    expect(result).toBe(cached);
    expect(result?.unreadCount).toBe(2);
  });

  it("changes nothing for a notification that is not in the list", () => {
    const cached = list();
    expect(markReadInList(cached, "yok")).toBe(cached);
  });

  it("does not let the counter go below zero", () => {
    const cached: NotificationList = { ...list(), unreadCount: 0 };
    expect(markReadInList(cached, "a")?.unreadCount).toBe(0);
  });

  it("does not crash on an empty cache", () => {
    expect(markReadInList(undefined, "a")).toBeUndefined();
  });

  it("does not mutate the input", () => {
    const cached = list();
    markReadInList(cached, "a");
    expect(cached.data[0].isRead).toBe(false);
    expect(cached.unreadCount).toBe(2);
  });
});

describe("markAllReadInList", () => {
  it("marks everything read and zeroes the counter", () => {
    const result = markAllReadInList(list());

    expect(result?.data.every((i) => i.isRead)).toBe(true);
    expect(result?.unreadCount).toBe(0);
  });

  it("zeroes the counter rather than subtracting the visible rows", () => {
    // The server marks EVERY notification; the list holds only the first page.
    const cached: NotificationList = { ...list(), total: 57, totalPages: 3, unreadCount: 40 };
    expect(markAllReadInList(cached)?.unreadCount).toBe(0);
  });

  it("works on an empty list and does not crash without a cache", () => {
    const empty: NotificationList = { ...list(), data: [], unreadCount: 0 };
    expect(markAllReadInList(empty)?.data).toEqual([]);
    expect(markAllReadInList(undefined)).toBeUndefined();
  });
});
