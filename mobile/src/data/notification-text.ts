import type { TranslationKey } from "../i18n/dictionaries";

/**
 * @file notification-text.ts
 * @description Bildirimin cümlesini ve hedefini belirler — SAF.
 *
 * Metin iki katmanlı kuruluyor: dış cümle türe göre ("… beğendi"), içindeki
 * `{target}` de ayrı bir anahtardan ("“Lagavulin 16” tadımınızı" ya da "tadım
 * notunuzu"). Tür başına dallanma yanlış cümleyi hata vermeden üretebilecek
 * türden — takip bildiriminde hedef hiç kullanılmıyor, beğenide zorunlu.
 * O yüzden ağdan ve React'ten ayrı, testli.
 */

export type NotificationType = "follow" | "like" | "comment";

/** Sunucunun NotificationDTO'sundan mobilin kullandığı alanlar (bilerek kopya). */
export interface AppNotification {
  id: string;
  type: NotificationType;
  actor: { id: string; name: string; profilePicture?: string };
  isRead: boolean;
  createdAt: string;
  tastingNoteId?: string;
  /** Bildirim metnindeki viski adı ("Lagavulin 16") */
  whiskeyLabel?: string;
  commentExcerpt?: string;
}

export interface NotificationMessage {
  /** Dış cümlenin anahtarı. */
  key: TranslationKey;
  /** `{target}` yerine konacak metnin anahtarı; takip bildiriminde yok. */
  targetKey?: TranslationKey;
  /** targetKey "targetNamed" ise cümleye giren viski adı. */
  whiskeyLabel?: string;
}

const MESSAGE_KEYS: Record<NotificationType, TranslationKey> = {
  follow: "notifications.follow",
  like: "notifications.like",
  comment: "notifications.comment",
};

/**
 * Hangi cümle, hangi hedef.
 *
 * Takipte hedef YOK: "sizi takip etmeye başladı" cümlesinde `{target}` yer
 * tutucusu bulunmuyor, gereksiz yere üretmek çeviriye sızabilirdi.
 */
export function notificationMessage(notification: AppNotification): NotificationMessage {
  const key = MESSAGE_KEYS[notification.type];

  if (notification.type === "follow") return { key };

  return notification.whiskeyLabel
    ? { key, targetKey: "notifications.targetNamed", whiskeyLabel: notification.whiskeyLabel }
    : { key, targetKey: "notifications.targetGeneric" };
}

/**
 * Bildirime dokununca gidilecek ekran.
 *
 * Beğeni/yorum bildiriminde not kimliği eksikse aktörün profiline düşülüyor —
 * web'deki geri düşüşün aynısı. Not silinmişse bildirim ortada kalabiliyor ve
 * boş bir ekrana götürmek, hiçbir yere götürmemekten kötü.
 *
 * Dönüş tipi düz `string` değil: expo-router'ın ürettiği rota tipleri serbest
 * metni kabul etmiyor. Şablon literal tipi bu dosyayı expo'ya bağlamadan
 * `router.push`'a geçecek kadar dar — modül Node altında test edilebilir kalıyor.
 */
export type NotificationRoute =
  | `/(app)/akis/not/${string}`
  | `/(app)/akis/kullanici/${string}`;

export function notificationRoute(notification: AppNotification): NotificationRoute {
  if (notification.type !== "follow" && notification.tastingNoteId) {
    return `/(app)/akis/not/${notification.tastingNoteId}`;
  }

  return `/(app)/akis/kullanici/${notification.actor.id}`;
}
