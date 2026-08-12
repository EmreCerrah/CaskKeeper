import type { WhiskeyListParams } from "./keys";

/**
 * @file list-query.ts
 * @description The query string for the catalogue list — PURE.
 *
 * Kept out of whiskeys.ts because that file pulls in react-query and the API
 * client, which reach all the way down to React Native and cannot be loaded
 * under Node. The logic worth testing is here; the part that touches the
 * network is there.
 */

export const PAGE_SIZE = 20;

export function buildListQuery(params: WhiskeyListParams, page: number): string {
  const search = new URLSearchParams();

  // A filter that was not set is not sent AT ALL: an empty `type=` could be
  // read by the server as "those with an empty type", and the list would be
  // quietly wrong.
  if (params.search) search.set("search", params.search);
  if (params.type) search.set("type", params.type);
  if (params.region) search.set("region", params.region);
  if (params.country) search.set("country", params.country);

  search.set("page", String(page));
  search.set("limit", String(PAGE_SIZE));

  return `/api/whiskeys?${search.toString()}`;
}
