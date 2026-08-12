import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import { adjustCommentCount, adjustCommentCountInPages, type InfiniteData } from "./interaction-cache";
import type { FeedNote } from "./feed";

/**
 * @file comments.ts
 * @description Tadım notu yorumlarına erişimin tek yolu.
 */

export interface CommentAuthor {
  id: string;
  name: string;
  profilePicture?: string;
}

/** Sunucunun CommentDTO'sundan mobilin kullandığı alanlar (bilerek kopya). */
export interface Comment {
  id: string;
  tastingNoteId: string;
  author: CommentAuthor;
  body: string;
  createdAt: string;
  /** Silme yetkisini SUNUCU hesaplıyor — yazarı ya da notun sahibi. */
  canDelete: boolean;
}

/**
 * Bir notun yorumları.
 *
 * Token zorunlu değil ama gönderiliyor: `canDelete` isteği yapana göre
 * hesaplanıyor, anonim istekte her yorum silinemez görünür.
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
 * Yorum sayısını akış ve not detayı önbelleklerinde kaydırır.
 *
 * Yorumun kendisi listede sunucudan geliyor, ama sayı bambaşka iki önbellekte
 * duruyor; dokunulmazsa akış kartı "2 yorum" derken altında üç yorum görünür.
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
 * Yorum ekler — İYİMSER DEĞİL.
 *
 * Sunucu gerçek yorumu döndürüyor: kimlik, tarih ve populate edilmiş yazar.
 * Bunları istemcide uydurup bir saniye sonra gerçeğiyle değiştirmek,
 * kullanıcının kendi yazdığı yorumun gözünün önünde yer değiştirmesi olurdu.
 * Beğeninin iyimser olmasıyla çelişmiyor: orada değişen tek şey bir sayı.
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

/** Yorumu siler. Yetkiyi sunucu doğruluyor; `canDelete` yalnızca arayüz içindir. */
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
