import type { AppNotification } from "./notification-text";

/**
 * @file notification-cache.ts
 * @description Okundu işaretlemeyi önbellekte yerinde uygular — SAF.
 *
 * İşaretleme iyimser, çünkü sekme rozeti de aynı anda değişmeli; sunucuyu
 * beklemek, dokunulan bildirim okunmuş görünürken rozetin bir saniye eski
 * kalması demek olurdu.
 *
 * Ama satırın `isRead`'i ile `unreadCount` AYNI yanıtın iki ayrı parçası: biri
 * güncellenip diğeri unutulduğunda hiçbir hata çıkmaz, yalnızca rozet yalan
 * söyler. interaction-cache.ts'teki gerekçenin aynısı.
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
 * Tek bildirimi okunmuş yapar ve sayacı bir azaltır.
 *
 * Zaten okunmuşsa hiçbir şey değişmez: aynı satıra ikinci kez dokunmak sayacı
 * olduğundan düşük göstermemeli.
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
 * Hepsini okunmuş yapar.
 *
 * Sayaç sıfırlanıyor, "görünen satır sayısı kadar azalt" değil: sunucu tüm
 * bildirimleri işaretliyor, oysa liste yalnızca ilk sayfayı taşıyor.
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
