import type { QueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { readToken } from "../auth/storage";
import { mutationKeys } from "./keys";
import { wishlistToggleRequest, type WishlistToggleVariables } from "./offline-writes";

/**
 * @file mutation-defaults.ts
 * @description Gives a write back its function after the app was restarted.
 *
 * A mutation started with no connection does not fail — it PAUSES, and the
 * paused mutation is written to disk along with the query cache. What reaches
 * the disk is the key, the variables and the state; the function is not
 * serialisable and does not survive (see `dehydrateMutation` in query-core).
 *
 * So on the next launch the queue holds a write with everything except the one
 * thing needed to perform it. Hydration rebuilds each mutation through
 * `mutationCache.build`, which applies whatever `setMutationDefaults` has
 * registered for that key — this file is that registration, and it is why the
 * writes here carry a `mutationKey` at all.
 *
 * It runs outside React, before anything is rendered, so it cannot read the
 * token from `useAuth`. It reads it from the secure store per call instead,
 * which is also more correct than a captured value: a write replayed hours
 * later goes out with the token that is valid THEN, not the one that was in
 * scope when the user tapped.
 */
export function registerMutationDefaults(queryClient: QueryClient): void {
  queryClient.setMutationDefaults(mutationKeys.wishlist.toggle(), {
    mutationFn: async (variables: WishlistToggleVariables) => {
      const { path, method } = wishlistToggleRequest(variables);
      return await apiRequest<{ wishlisted: boolean }>(path, {
        method,
        token: await readToken(),
      });
    },
  });
}
