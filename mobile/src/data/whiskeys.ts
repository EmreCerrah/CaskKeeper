import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { queryKeys, type WhiskeyListParams } from "./keys";
import { buildListQuery } from "./list-query";

/**
 * @file whiskeys.ts
 * @description The ONLY way into catalogue data.
 *
 * Screens never call apiRequest directly; they use the hooks here. The reason
 * is offline: when persistence arrived, this is the layer that changed, not
 * the screens. It is the client-side counterpart of the web's "the database is
 * reached only through a repository" rule.
 */

/**
 * The fields of the server's WhiskeyDTO that the app uses.
 *
 * A DELIBERATE copy: the app does not import the web's `src/lib/types/dto.ts`
 * (it will move to its own repository). The contract is one-way — if the
 * server adds a field nothing breaks here; if it removes one, the break is at
 * runtime rather than compile time, which the screens absorb with optional
 * fields.
 */
export interface Whiskey {
  id: string;
  brand: string;
  name: string;
  slug: string;
  distillery: string;
  type: string;
  region: string;
  country: string;
  subRegion?: string;
  abv: number;
  age?: number;
  caskType?: string;
  bottlingYear?: number;
  vintage?: number;
  limitedEdition: boolean;
  description?: string;
  flavorProfile: string[];
  awards: string[];
  imageUrl?: string;
  tags: string[];
}

interface PaginatedWhiskeys {
  data: Whiskey[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WhiskeyFacets {
  types: string[];
  regions: string[];
  countries: string[];
}

/** The catalogue list — infinite scroll. */
export function useWhiskeys(params: WhiskeyListParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.whiskeys.list(params),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => apiRequest<PaginatedWhiskeys>(buildListQuery(params, pageParam)),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

/** A single whisky (detail screen). */
export function useWhiskey(slug: string) {
  return useQuery({
    queryKey: queryKeys.whiskeys.detail(slug),
    queryFn: () => apiRequest<Whiskey>(`/api/whiskeys/${slug}`),
    enabled: slug.length > 0,
  });
}

/**
 * The values behind the filter menu.
 *
 * The types, regions and countries actually present in the catalogue — a
 * hand-written list would quietly fall behind the day a new region was
 * imported.
 */
export function useFacets() {
  return useQuery({
    queryKey: queryKeys.whiskeys.facets(),
    queryFn: () => apiRequest<WhiskeyFacets>("/api/whiskeys/facets"),
  });
}

