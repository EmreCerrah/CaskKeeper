import type { TranslationKey } from "../i18n/dictionaries";

/**
 * @file notification-text.ts
 * @description Works out a notification's sentence and its target — PURE.
 *
 * The text is built in two layers: the outer sentence depends on the type
 * ("liked …"), and the `{target}` inside it comes from its own key ("your
 * 'Lagavulin 16' tasting" or "your tasting note"). Branching per type is the
 * kind of logic that produces a wrong sentence without raising an error — a
 * follow notification has no target at all, a like requires one. Hence: away
 * from the network and from React, and tested.
 */

export type NotificationType = "follow" | "like" | "comment";

/** The fields of the server's NotificationDTO the app uses (a deliberate copy). */
export interface AppNotification {
  id: string;
  type: NotificationType;
  actor: { id: string; name: string; profilePicture?: string };
  isRead: boolean;
  createdAt: string;
  tastingNoteId?: string;
  /** The whisky name inside the notification text ("Lagavulin 16") */
  whiskeyLabel?: string;
  commentExcerpt?: string;
}

export interface NotificationMessage {
  /** Key for the outer sentence. */
  key: TranslationKey;
  /** Key for the text replacing `{target}`; absent on follow notifications. */
  targetKey?: TranslationKey;
  /** The whisky name that goes into the sentence when targetKey is "targetNamed". */
  whiskeyLabel?: string;
}

const MESSAGE_KEYS: Record<NotificationType, TranslationKey> = {
  follow: "notifications.follow",
  like: "notifications.like",
  comment: "notifications.comment",
};

/**
 * Which sentence, which target.
 *
 * A follow has NO target: "started following you" contains no `{target}`
 * placeholder, and producing one anyway could leak into the translation.
 */
export function notificationMessage(notification: AppNotification): NotificationMessage {
  const key = MESSAGE_KEYS[notification.type];

  if (notification.type === "follow") return { key };

  return notification.whiskeyLabel
    ? { key, targetKey: "notifications.targetNamed", whiskeyLabel: notification.whiskeyLabel }
    : { key, targetKey: "notifications.targetGeneric" };
}

/**
 * The screen a notification opens when tapped.
 *
 * If a like/comment notification is missing its note id, it falls back to the
 * actor's profile — the same fallback as the web. A notification can outlive
 * its note, and leading somewhere empty is worse than leading nowhere.
 *
 * The return type is not a plain `string`: expo-router's generated route types
 * reject free text. A template literal type is narrow enough to pass to
 * `router.push` without tying this file to expo — the module stays testable
 * under Node.
 */
export type NotificationRoute =
  | `/(app)/feed/note/${string}`
  | `/(app)/feed/user/${string}`;

export function notificationRoute(notification: AppNotification): NotificationRoute {
  if (notification.type !== "follow" && notification.tastingNoteId) {
    return `/(app)/feed/note/${notification.tastingNoteId}`;
  }

  return `/(app)/feed/user/${notification.actor.id}`;
}
