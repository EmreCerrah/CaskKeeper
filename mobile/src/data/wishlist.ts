import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { mutationKeys, queryKeys } from "./keys";
import { addToWishlist, removeFromWishlist, type WishlistPage } from "./wishlist-cache";
import type { Whiskey } from "./whiskeys";

/**
 * @file wishlist.ts
 * @description The only way into the wishlist.
 *
 * Personal data: every request carries the session token. Screens never see
 * apiRequest (see the reasoning in whiskeys.ts).
 */

interface WishlistStatus {
  wishlisted: boolean;
}

/**
 * The whole list.
 *
 * The server caps `limit` at 100. No pagination was added: a wishlist is small
 * by nature, and even past 100 the list screen still works — only the oldest
 * entries fall off. The button on the detail screen does NOT read this list;
 * it asks its own endpoint, so even then it cannot show the wrong state.
 */
export function useWishlist() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.wishlist.list(),
    queryFn: () => apiRequest<WishlistPage>("/api/wishlist?limit=100", { token }),
    enabled: Boolean(token),
  });
}

/** One whisky's state — for the button on the catalogue detail screen. */
export function useIsWishlisted(whiskeyId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.wishlist.status(whiskeyId),
    queryFn: () => apiRequest<WishlistStatus>(`/api/wishlist/${whiskeyId}`, { token }),
    enabled: Boolean(token) && whiskeyId.length > 0,
  });
}

/**
 * Add / remove — OPTIMISTIC, and it survives being offline.
 *
 * The web button waits for the server; this one does not, for the same reason
 * as the like button: a bookmark that waits after a tap feels broken. If the
 * request fails the cache is restored and refetched.
 *
 * Adding to the list needs the whisky itself, so the caller passes it — the
 * detail screen already has it in hand.
 *
 * There is no `mutationFn` here: it comes from the key, registered in
 * mutation-defaults.ts. That indirection is what lets a tap made in aeroplane
 * mode be replayed after the app has been closed and reopened — a function
 * cannot be written to disk, a key can. The optimistic handlers below stay
 * where they are; they run on the tap, not on the replay.
 *
 * Replaying is safe in any order or multiplicity: the server's add is an
 * upsert and its remove a delete, so add/remove/add lands on the right state
 * and no duplicate can raise a conflict.
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.wishlist.toggle(),

    onMutate: async ({ whiskey, wishlisted }: { whiskey: Whiskey; wishlisted: boolean }) => {
      const statusKey = queryKeys.wishlist.status(whiskey.id);
      const listKey = queryKeys.wishlist.list();

      // Stop an in-flight refetch from overwriting the optimistic value we are
      // about to write.
      await queryClient.cancelQueries({ queryKey: statusKey });
      await queryClient.cancelQueries({ queryKey: listKey });

      const previousStatus = queryClient.getQueryData<WishlistStatus>(statusKey);
      const previousList = queryClient.getQueryData<WishlistPage>(listKey);

      queryClient.setQueryData<WishlistStatus>(statusKey, { wishlisted: !wishlisted });
      queryClient.setQueryData<WishlistPage | undefined>(listKey, (cached) =>
        wishlisted
          ? removeFromWishlist(cached, whiskey.id)
          : addToWishlist(cached, whiskey, new Date().toISOString())
      );

      return { previousStatus, previousList, whiskeyId: whiskey.id };
    },

    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKeys.wishlist.status(context.whiskeyId), context.previousStatus);
      queryClient.setQueryData(queryKeys.wishlist.list(), context.previousList);
    },

    onSettled: () => {
      // Let the ordering and total come from the server — the optimistic copy
      // is close, not exact.
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });
}
