import type { AppNotification } from "./notification-text";

/**
 * @file notification-cache.ts
 * @description Applies "mark as read" in place in the cache — PURE.
 *
 * Marking is optimistic because the tab badge has to move at the same time;
 * waiting for the server would leave the count stale for a second under a
 * notification that already looks read.
 *
 * But a row's `isRead` and `unreadCount` are two parts of the SAME response:
 * update one and forget the other and nothing errors, the badge simply lies.
 * The same reasoning as interaction-cache.ts.
 */

export interface NotificationList {
  data: AppNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

/**
 * Marks one notification read and decrements the counter.
 *
 * Nothing changes if it was already read: tapping the same row twice must not
 * push the counter below the truth.
 */
export function markReadInList(
  cached: NotificationList | undefined,
  notificationId: string
): NotificationList | undefined {
  if (!cached) return cached;

  const target = cached.data.find((item) => item.id === notificationId);
  if (!target || target.isRead) return cached;

  return {
    ...cached,
    data: cached.data.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
    unreadCount: Math.max(0, cached.unreadCount - 1),
  };
}

/**
 * Marks everything read.
 *
 * The counter is zeroed rather than reduced by the number of visible rows: the
 * server marks every notification, while the list holds only the first page.
 */
export function markAllReadInList(
  cached: NotificationList | undefined
): NotificationList | undefined {
  if (!cached) return cached;

  return {
    ...cached,
    data: cached.data.map((item) => (item.isRead ? item : { ...item, isRead: true })),
    unreadCount: 0,
  };
}
