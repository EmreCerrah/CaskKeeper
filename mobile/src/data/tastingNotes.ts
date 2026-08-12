import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
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

interface PaginatedNotes {
  data: TastingNote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useMyNotes() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.tastingNotes.mine(),
    queryFn: () => apiRequest<PaginatedNotes>("/api/tasting-notes?limit=50", { token }),
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

export function useCreateNote() {
  const { token } = useAuth();
  const invalidate = useInvalidateNotes();

  return useMutation({
    mutationFn: (input: TastingNoteInput) =>
      apiRequest<TastingNote>("/api/tasting-notes", { method: "POST", body: input, token }),
    onSuccess: invalidate,
  });
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
