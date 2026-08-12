import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { FeedNote } from "./feed";
import { toggleLikeInPages, toggleLikeOnNote, type InfiniteData } from "./interaction-cache";

/**
 * @file interactions.ts
 * @description Likes.
 *
 * Updated OPTIMISTICALLY: a heart that waits for a network round trip feels
 * broken. If the request fails the cache is restored, then refetched from the
 * server.
 *
 * The transformation itself lives in interaction-cache.ts and is tested — the
 * feed is paginated, so finding the right note means walking pages, and
 * corrupting the wrong one is easy.
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
      // Stop an in-flight refetch from overwriting the optimistic value we
      // are about to write.
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
      // Let the real count come from the server: somebody else may have liked
      // it at the same moment.
      queryClient.invalidateQueries({ queryKey: queryKeys.tastingNotes.detail(noteId) });
    },
  });
}
