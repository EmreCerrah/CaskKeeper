import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import { markAllReadInList, markReadInList, type NotificationList } from "./notification-cache";

/**
 * @file notifications.ts
 * @description Bildirimlere erişimin tek yolu.
 *
 * İki ayrı sorgu var: liste (bildirim ekranı) ve rozet. Rozet sekme çubuğunda
 * her zaman canlı duruyor; onu liste sorgusundan beslemek, kullanıcı bildirim
 * ekranını hiç açmasa bile her açılışta 20 bildirimlik gövde indirmek olurdu.
 * Sunucuda yalnızca sayıyı veren bir uç yok, o yüzden `limit=1`.
 */

/** Rozet, uygulama geri açıldığında güncel olmalı — bkz. data/focus.ts. */
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

/** Yalnızca okunmamış sayısı — sekme rozeti için. */
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
 * Rozet ve liste önbelleğini birlikte günceller.
 *
 * İkisi ayrı sorgu ama aynı gerçeği anlatıyor; biri güncellenip diğeri
 * unutulursa rozet yalan söyler ve bu hiçbir yerde hata vermez.
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
 * Tek bildirimi okundu işaretler — İYİMSER.
 *
 * Kullanıcı satıra dokunup hemen hedef ekrana gidiyor; sunucuyu beklemek,
 * geri döndüğünde satırın hâlâ okunmamış görünmesi demek olurdu.
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

/** Tümünü okundu işaretler — aynı gerekçeyle iyimser. */
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
