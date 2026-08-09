import { useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { TastingNote } from "./tastingNotes";

/**
 * @file feed.ts
 * @description Takip edilen kişilerin herkese açık tadımları.
 *
 * Gizlilik sunucuda: `/api/feed` yalnızca `visibility: "public"` notları
 * döndürüyor ve yalnızca takip edilenlerden. İstemci ayrıca filtrelemiyor —
 * filtreyi iki yere koymak, birinin unutulduğu gün sessiz bir sızıntı olurdu.
 */

export interface FeedNote extends TastingNote {
  author?: { id: string; name: string; profilePicture?: string };
  interactions?: { likeCount: number; commentCount: number; isLikedByViewer: boolean };
}

interface FeedPage {
  data: FeedNote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export function useFeed() {
  const { token } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.feed(),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      apiRequest<FeedPage>(`/api/feed?page=${pageParam}&limit=${PAGE_SIZE}`, { token }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: Boolean(token),
  });
}
