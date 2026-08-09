import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { Whiskey } from "./whiskeys";

/**
 * @file tastingNotes.ts
 * @description Tadım notlarına erişimin tek yolu.
 *
 * Notlar kişisel veri: her istek oturum token'ı taşımak zorunda, bu yüzden
 * hook'lar token'ı AuthContext'ten alıyor. Ekranların token'ı elden ele
 * taşıması gerekmiyor.
 */

export type FinishLength = "short" | "medium" | "long";
export type Visibility = "private" | "public";

/**
 * Sunucunun TastingNoteDTO'sundan mobilin kullandığı alanlar.
 * Bilerek kopya — mobil web'in dto.ts'ini import etmiyor (ayrı repo kuralı).
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

/** Formun sunucuya gönderdiği gövde. */
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
 * Yazma işlemlerinden sonra not önbelleği tümden geçersizleştirilir.
 *
 * Tek tek güncellemek yerine kökü geçersizleştirmek bilinçli: listenin sırası
 * ve sayfalaması sunucuda belirleniyor, elle yama yapmak kolayca yanlış sıra
 * üretirdi. Notlar az sayıda, yeniden çekmenin maliyeti önemsiz.
 */
function useInvalidateNotes() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.tastingNotes.all });
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
