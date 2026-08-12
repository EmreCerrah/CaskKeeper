import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { TastingNote } from "./tastingNotes";

/**
 * @file users.ts
 * @description People search, public profiles and following.
 */

export interface UserSearchResult {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  publicNoteCount: number;
  isFollowedByViewer: boolean;
  isFollowingViewer: boolean;
  /** A mutual follow — shown as a "Friend" badge in the interface. */
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
  /** On your own profile the follow button is not shown. */
  isOwnProfile: boolean;
}

interface PaginatedNotes {
  data: TastingNote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** With an empty search the server returns the "discover" list (newest members). */
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
 * Follow / unfollow.
 *
 * NO optimistic update here, deliberately: following changes the whole feed
 * (every one of that person's notes enters or leaves it), and imitating that
 * on the client would mean guessing the server's ordering wrong. The list is
 * refetched instead.
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
