import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { t } from "../i18n";
import { mutationKeys, queryKeys } from "./keys";
import { addNote, failNote, optimisticNote, removeNote, replaceNote, type NotePage } from "./note-cache";
import type { CreateNoteVariables } from "./offline-writes";
import type { Whiskey } from "./whiskeys";

/**
 * @file tastingNotes.ts
 * @description The only way into tasting notes.
 *
 * Notes are personal data: every request has to carry the session token, so
 * the hooks take it from AuthContext. Screens never pass the token around.
 */

export type FinishLength = "short" | "medium" | "long";
export type Visibility = "private" | "public";

/**
 * The fields of the server's TastingNoteDTO the app uses.
 * A deliberate copy — the app does not import the web's dto.ts (separate
 * repository rule).
 */
export interface TastingNote {
  id: string;
  whiskeyId: string;
  whiskey?: Whiskey;
  tastingDate: string;
  rating: number;
  noseTags: string[];
  noseNotes?: string;
  palateTags: string[];
  palateNotes?: string;
  finishTags: string[];
  finishNotes?: string;
  finishLength: FinishLength;
  personalNotes?: string;
  visibility: Visibility;
  isFavorite: boolean;
  createdAt: string;

  /**
   * CLIENT ONLY — never sent by the server, never sent to it.
   *
   * Present on a note written with no connection: `pending` while it waits in
   * the queue, `failed` once it has been refused for a reason retrying cannot
   * fix. Absent means the server has it.
   */
  localStatus?: "pending" | "failed";
  /** Why it was refused — shown on the card, so it is already a sentence. */
  localError?: string;
}

/** The body the form sends to the server. */
export interface TastingNoteInput {
  whiskey: string;
  tastingDate: string;
  rating: number;
  noseTags: string[];
  noseNotes?: string;
  palateTags: string[];
  palateNotes?: string;
  finishTags: string[];
  finishNotes?: string;
  finishLength: FinishLength;
  personalNotes?: string;
  visibility: Visibility;
  isFavorite: boolean;
}

export function useMyNotes() {
  const { token } = useAuth();

  // NotePage rather than a second copy of the same shape: the optimistic
  // insert edits this exact cache entry, and two declarations of one page
  // would drift the moment either changed.
  return useQuery({
    queryKey: queryKeys.tastingNotes.mine(),
    queryFn: () => apiRequest<NotePage>("/api/tasting-notes?limit=50", { token }),
    enabled: Boolean(token),
  });
}

export function useNote(id: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.tastingNotes.detail(id),
    queryFn: () => apiRequest<TastingNote>(`/api/tasting-notes/${id}`, { token }),
    enabled: Boolean(token) && id.length > 0,
  });
}

/**
 * After any write, the whole note cache is invalidated.
 *
 * Invalidating the root rather than patching entries is deliberate: the
 * server decides ordering and pagination, and hand-patching would easily
 * produce the wrong order. There are few notes; refetching costs nothing
 * worth saving.
 */
function useInvalidateNotes() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tastingNotes.all });
    // The dashboard is computed from these notes: without a refresh after a
    // write, "Total Tastings" keeps the old number and the user concludes
    // their note was not saved.
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics() });
    queryClient.invalidateQueries({ queryKey: queryKeys.recommendations() });
  };
}

/**
 * A new note — OPTIMISTIC, and it survives being offline.
 *
 * The note appears in the list on submit rather than on the server's reply.
 * That is not polish: with no connection the request PAUSES, so waiting for it
 * would leave the user staring at a form that never returns, and a note they
 * would reasonably assume was lost.
 *
 * Like the wishlist toggle there is no `mutationFn` here — it is registered
 * against the key in mutation-defaults.ts, which is what lets a note written in
 * aeroplane mode be sent after the app has been closed and reopened.
 *
 * The dashboard and the statistics are deliberately NOT invalidated while the
 * note is queued (see onSuccess): offline they cannot be refetched anyway, and
 * writing an optimistic total into them would be a second claim to walk back.
 * The pending row in the list is the honest signal.
 */
export function useCreateNote() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateNotes();

  const patchList = (patch: (cached: NotePage | undefined) => NotePage | undefined) =>
    queryClient.setQueryData<NotePage | undefined>(queryKeys.tastingNotes.mine(), patch);

  // The generics are spelled out because there is no mutationFn here to infer
  // them from — without them the saved note arrives as `unknown`.
  return useMutation<TastingNote, Error, CreateNoteVariables>({
    mutationKey: mutationKeys.tastingNotes.create(),

    onMutate: async ({ input, whiskey, pendingId }) => {
      // Stop an in-flight refetch from landing after the insert and wiping it.
      await queryClient.cancelQueries({ queryKey: queryKeys.tastingNotes.mine() });
      patchList((cached) => addNote(cached, optimisticNote(pendingId, input, whiskey)));
    },

    onSuccess: (saved, { pendingId }) => {
      // In place, so the row does not jump at the moment the connection returns.
      patchList((cached) => replaceNote(cached, pendingId, saved));
      // Only now: the note is real, so the figures computed from it can be.
      invalidate();
    },

    onError: (error, { pendingId }) => {
      // Retries have already run by this point (see the defaults in
      // queryClient.ts), so reaching here means sending it again will not help.
      // The note is kept and the reason put on its card — the words are the
      // user's, and a failed request is no reason to delete them.
      //
      // A 401 lands here too. The token lasts seven days and a queued note can
      // outlive it; carrying the write across a fresh sign-in would mean the
      // queue surviving sign-out, which it deliberately does not (AuthContext).
      // So the note is kept, visible, and has to be sent again by hand.
      patchList((cached) =>
        failNote(cached, pendingId, error instanceof Error ? error.message : t("notes.saveFailed"))
      );
    },
  });
}

/**
 * Removes a note that was never accepted, from the list only.
 *
 * No request goes out: the server never had it. This exists because a failed
 * note is deliberately kept — without a way to dismiss it, the row would stay
 * in the list for good.
 */
export function useDiscardPendingNote() {
  const queryClient = useQueryClient();

  return (pendingId: string) => {
    queryClient.setQueryData<NotePage | undefined>(queryKeys.tastingNotes.mine(), (cached) =>
      removeNote(cached, pendingId)
    );
  };
}

export function useUpdateNote(id: string) {
  const { token } = useAuth();
  const invalidate = useInvalidateNotes();

  return useMutation({
    mutationFn: (input: Partial<TastingNoteInput>) =>
      apiRequest<TastingNote>(`/api/tasting-notes/${id}`, { method: "PATCH", body: input, token }),
    onSuccess: invalidate,
  });
}

export function useDeleteNote() {
  const { token } = useAuth();
  const invalidate = useInvalidateNotes();

  return useMutation({
    mutationFn: (id: string) => apiRequest<null>(`/api/tasting-notes/${id}`, { method: "DELETE", token }),
    onSuccess: invalidate,
  });
}
