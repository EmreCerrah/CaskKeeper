import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import { adjustCommentCount, adjustCommentCountInPages, type InfiniteData } from "./interaction-cache";
import type { FeedNote } from "./feed";

/**
 * @file comments.ts
 * @description The only way into tasting note comments.
 */

export interface CommentAuthor {
  id: string;
  name: string;
  profilePicture?: string;
}

/** The fields of the server's CommentDTO the app uses (a deliberate copy). */
export interface Comment {
  id: string;
  tastingNoteId: string;
  author: CommentAuthor;
  body: string;
  createdAt: string;
  /** The SERVER decides who may delete — the author or the note's owner. */
  canDelete: boolean;
}

/**
 * One note's comments.
 *
 * The token is not required but is sent anyway: `canDelete` is computed per
 * requester, and anonymously every comment looks undeletable.
 */
export function useComments(noteId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.comments.list(noteId),
    queryFn: () => apiRequest<Comment[]>(`/api/tasting-notes/${noteId}/comments`, { token }),
    enabled: noteId.length > 0,
  });
}

/**
 * Shifts the comment count in the feed and note-detail caches.
 *
 * The comment itself arrives from the server in the list, but the count lives
 * in two entirely different caches; left alone, the feed card says "2
 * comments" above three of them.
 */
function useShiftCommentCount() {
  const queryClient = useQueryClient();

  return (noteId: string, delta: number) => {
    queryClient.setQueryData(queryKeys.feed(), (cached: InfiniteData<FeedNote> | undefined) =>
      adjustCommentCountInPages(cached, noteId, delta)
    );
    queryClient.setQueryData(
      queryKeys.tastingNotes.detail(noteId),
      (cached: FeedNote | undefined) => (cached ? adjustCommentCount(cached, delta) : cached)
    );
  };
}

/**
 * Posts a comment — NOT optimistic.
 *
 * The server returns the real comment: its id, its timestamp and its populated
 * author. Inventing those on the client and swapping them for the real ones a
 * second later would make the user's own words move in front of them. This
 * does not contradict the optimistic like: there, the only thing that changes
 * is a number.
 */
export function useAddComment(noteId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const shiftCount = useShiftCommentCount();

  return useMutation({
    mutationFn: (body: string) =>
      apiRequest<Comment>(`/api/tasting-notes/${noteId}/comments`, {
        method: "POST",
        body: { body },
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(noteId) });
      shiftCount(noteId, 1);
    },
  });
}

/** Deletes a comment. The server enforces permission; `canDelete` is only for the UI. */
export function useDeleteComment(noteId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const shiftCount = useShiftCommentCount();

  return useMutation({
    mutationFn: (commentId: string) =>
      apiRequest<null>(`/api/comments/${commentId}`, { method: "DELETE", token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(noteId) });
      shiftCount(noteId, -1);
    },
  });
}
