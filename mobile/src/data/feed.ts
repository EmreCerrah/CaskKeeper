import { useInfiniteQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { TastingNote } from "./tastingNotes";

/**
 * @file feed.ts
 * @description The public tastings of the people you follow.
 *
 * Privacy is enforced on the server: `/api/feed` returns only notes with
 * `visibility: "public"`, and only from followed users. The client does not
 * filter again — a filter in two places is one that can be forgotten, and that
 * day it leaks.
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
