import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/response";
import { registerMutationDefaults } from "./mutation-defaults";
import { isRetryableStatus } from "./offline-writes";

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
  const client = new QueryClient({
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

      mutations: {
        // Writes are not retried by default. That is the wrong answer once a
        // write can be replayed hours later: the reply then arrives without a
        // user watching, and a single flaky response would put a permanent
        // "failed" on a note that only needed asking twice.
        //
        // Only what a second attempt could fix — the server was unreachable
        // (status 0) or answered 5xx. A refusal about the request itself is
        // final, and retrying a 401 with the same expired token is pointless.
        retry: (failureCount, error) => {
          if (failureCount >= 2) return false;
          return error instanceof ApiError && isRetryableStatus(error.status);
        },
      },
    },
  });

  // Here rather than at the call site so it cannot be forgotten. A write that
  // survives being offline carries a mutationKey INSTEAD of its function, so a
  // client without this registration would hand the user a button that throws
  // on tap — and only for the writes that were meant to be the robust ones.
  registerMutationDefaults(client);

  return client;
}
