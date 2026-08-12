import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/response";

/**
 * @file queryClient.ts
 * @description The app's single QueryClient.
 *
 * Offline support was always going to land HERE: a persistent store plugged in
 * through `persistQueryClient`, with no screen changing. The settings were
 * chosen with that day in mind — `gcTime` in particular is long, so the cache
 * is not discarded before it reaches disk.
 */

/** The catalogue barely changes; measuring freshness in minutes is enough. */
const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES,
        gcTime: ONE_DAY,

        // Auth failures are not retried: if the token has expired, asking
        // three more times means nothing — the user has to sign in again.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
            return false;
          }
          return failureCount < 2;
        },

        // On mobile, hitting the network every time a screen regains focus
        // drains the battery; the data counts as fresh for staleTime anyway.
        refetchOnWindowFocus: false,
      },
    },
  });
}
