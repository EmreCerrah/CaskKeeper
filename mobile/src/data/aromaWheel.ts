import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { queryKeys } from "./keys";

/**
 * @file aromaWheel.ts
 * @description Aroma categories — from the server.
 *
 * The list is NOT copied into the app: the tags are written to the database as
 * literal text and the statistics match on them. With a copy, changing a tag
 * on the web would make the two clients produce different text — nobody would
 * see an error, the statistics would simply be wrong.
 */

export interface AromaCategory {
  /** "fruity", "smoky_peaty" … — the client translates the heading from this id. */
  category: string;
  /** The stored values. NEVER translated; sent back exactly as received. */
  tags: string[];
}

export function useAromaWheel() {
  return useQuery({
    queryKey: queryKeys.aromaWheel(),
    queryFn: () => apiRequest<AromaCategory[]>("/api/aroma-wheel"),
    // Served from a constant; in practice it never changes.
    staleTime: Infinity,
  });
}
