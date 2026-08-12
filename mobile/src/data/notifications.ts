import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import { markAllReadInList, markReadInList, type NotificationList } from "./notification-cache";

/**
 * @file notifications.ts
 * @description The only way into notifications.
 *
 * There are two separate queries: the list (for the notification screen) and
 * the badge. The badge is always live in the tab bar; feeding it from the list
 * query would mean downloading twenty notifications on every launch even for
 * someone who never opens the screen. The server has no count-only endpoint,
 * hence `limit=1`.
 */

/** The badge must be current when the app comes back — see data/focus.ts. */
const BADGE_STALE_TIME = 30 * 1000;

export function useNotifications() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => apiRequest<NotificationList>("/api/notifications?limit=20", { token }),
    enabled: Boolean(token),
    refetchOnWindowFocus: true,
    staleTime: BADGE_STALE_TIME,
  });
}

/** The unread count only — for the tab badge. */
export function useUnreadCount(): number {
  const { token } = useAuth();

  const { data } = useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: () => apiRequest<NotificationList>("/api/notifications?limit=1", { token }),
    enabled: Boolean(token),
    refetchOnWindowFocus: true,
    staleTime: BADGE_STALE_TIME,
  });

  return data?.unreadCount ?? 0;
}

/**
 * Updates the badge and list caches together.
 *
 * They are separate queries telling the same truth; update one and forget the
 * other and the badge lies, without erroring anywhere.
 */
function useApplyToBothCaches() {
  const queryClient = useQueryClient();

  return (transform: (cached: NotificationList | undefined) => NotificationList | undefined) => {
    queryClient.setQueryData<NotificationList | undefined>(queryKeys.notifications.list(), transform);
    queryClient.setQueryData<NotificationList | undefined>(
      queryKeys.notifications.unread(),
      transform
    );
  };
}

/**
 * Marks one notification read — OPTIMISTIC.
 *
 * The user taps a row and leaves for the target screen straight away; waiting
 * for the server would mean the row still looks unread when they come back.
 */
export function useMarkRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const applyToBoth = useApplyToBothCaches();

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest<unknown>(`/api/notifications/${notificationId}/read`, { method: "POST", token }),

    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      const previousList = queryClient.getQueryData<NotificationList>(queryKeys.notifications.list());
      const previousUnread = queryClient.getQueryData<NotificationList>(
        queryKeys.notifications.unread()
      );

      applyToBoth((cached) => markReadInList(cached, notificationId));

      return { previousList, previousUnread };
    },

    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKeys.notifications.list(), context.previousList);
      queryClient.setQueryData(queryKeys.notifications.unread(), context.previousUnread);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/** Marks everything read — optimistic for the same reason. */
export function useMarkAllRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const applyToBoth = useApplyToBothCaches();

  return useMutation({
    mutationFn: () => apiRequest<unknown>("/api/notifications/read-all", { method: "POST", token }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      const previousList = queryClient.getQueryData<NotificationList>(queryKeys.notifications.list());
      const previousUnread = queryClient.getQueryData<NotificationList>(
        queryKeys.notifications.unread()
      );

      applyToBoth(markAllReadInList);

      return { previousList, previousUnread };
    },

    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKeys.notifications.list(), context.previousList);
      queryClient.setQueryData(queryKeys.notifications.unread(), context.previousUnread);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
