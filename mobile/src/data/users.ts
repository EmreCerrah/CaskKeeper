import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { TastingNote } from "./tastingNotes";

/**
 * @file users.ts
 * @description Kişi arama, herkese açık profil ve takip.
 */

export interface UserSearchResult {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  publicNoteCount: number;
  isFollowedByViewer: boolean;
  isFollowingViewer: boolean;
  /** Karşılıklı takip — arayüzde "Arkadaş" rozeti. */
  isMutual: boolean;
}

export interface PublicProfile {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  publicNoteCount: number;
  isFollowedByViewer: boolean;
  isFollowingViewer: boolean;
  isMutual: boolean;
  /** Kendi profilinse takip düğmesi gösterilmez. */
  isOwnProfile: boolean;
}

interface PaginatedNotes {
  data: TastingNote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Arama boşsa sunucu "keşfet" listesini (son üyeler) döndürüyor. */
export function useUserSearch(query: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.users.search(query),
    queryFn: () =>
      apiRequest<UserSearchResult[]>(`/api/users/search?q=${encodeURIComponent(query)}`, { token }),
  });
}

export function usePublicProfile(id: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.users.profile(id),
    queryFn: () => apiRequest<PublicProfile>(`/api/users/${id}`, { token }),
    enabled: id.length > 0,
  });
}

export function useUserNotes(id: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.users.notes(id),
    queryFn: () => apiRequest<PaginatedNotes>(`/api/users/${id}/notes?limit=50`, { token }),
    enabled: id.length > 0,
  });
}

/**
 * Takip et / bırak.
 *
 * Burada iyimser güncelleme YOK, bilerek: takip değişince akışın içeriği
 * baştan aşağı değişiyor (o kişinin bütün notları giriyor ya da çıkıyor) ve
 * bunu istemcide taklit etmek, sunucunun sıralamasını yanlış tahmin etmek
 * demek olurdu. Liste sunucudan yeniden alınır.
 */
export function useToggleFollow(userId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (following: boolean) =>
      apiRequest<{ following: boolean }>(`/api/users/${userId}/follow`, {
        method: following ? "DELETE" : "POST",
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
