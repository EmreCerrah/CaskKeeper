import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { FeedNote } from "./feed";
import { toggleLikeInPages, toggleLikeOnNote, type InfiniteData } from "./interaction-cache";

/**
 * @file interactions.ts
 * @description Beğeni.
 *
 * İYİMSER güncelleniyor: ağ turunu bekleyen bir kalp bozuk hissettirir. İstek
 * başarısız olursa önbellek eski hâline döner, sonra sunucudan tazelenir.
 *
 * Dönüşümün kendisi interaction-cache.ts'te ve testli — akış sayfalı olduğu için
 * doğru notu bulmak sayfalarda gezmek demek ve yanlış sayfayı bozmak kolay.
 */
export function useToggleLike() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, liked }: { noteId: string; liked: boolean }) =>
      apiRequest<unknown>(`/api/tasting-notes/${noteId}/like`, {
        method: liked ? "DELETE" : "POST",
        token,
      }),

    onMutate: async ({ noteId }) => {
      // Uçuştaki tazeleme, az sonra yazacağımız iyimser değeri ezmesin.
      await queryClient.cancelQueries({ queryKey: queryKeys.feed() });
      await queryClient.cancelQueries({ queryKey: queryKeys.tastingNotes.detail(noteId) });

      const previousFeed = queryClient.getQueryData<InfiniteData<FeedNote>>(queryKeys.feed());
      const previousNote = queryClient.getQueryData<FeedNote>(queryKeys.tastingNotes.detail(noteId));

      queryClient.setQueryData(queryKeys.feed(), (cached: InfiniteData<FeedNote> | undefined) =>
        toggleLikeInPages(cached, noteId)
      );
      queryClient.setQueryData(
        queryKeys.tastingNotes.detail(noteId),
        (cached: FeedNote | undefined) => (cached ? toggleLikeOnNote(cached) : cached)
      );

      return { previousFeed, previousNote, noteId };
    },

    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKeys.feed(), context.previousFeed);
      queryClient.setQueryData(queryKeys.tastingNotes.detail(context.noteId), context.previousNote);
    },

    onSettled: (_data, _error, { noteId }) => {
      // Gerçek sayı sunucudan gelsin: başka biri aynı anda beğenmiş olabilir.
      queryClient.invalidateQueries({ queryKey: queryKeys.tastingNotes.detail(noteId) });
    },
  });
}
