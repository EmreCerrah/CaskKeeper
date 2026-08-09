import type { WhiskeyListParams } from "./keys";

/**
 * @file list-query.ts
 * @description Katalog listesinin sorgu dizesi — SAF.
 *
 * whiskeys.ts'ten ayrı duruyor çünkü orası react-query ve API istemcisini içeri
 * alıyor, onlar da React Native'e kadar gidiyor; Node altında kurulamıyorlar.
 * Sınanmaya değer mantık burada, ağa dokunan kısım orada.
 */

export const PAGE_SIZE = 20;

export function buildListQuery(params: WhiskeyListParams, page: number): string {
  const search = new URLSearchParams();

  // Verilmeyen filtre HİÇ gönderilmez: boş bir `type=` sunucuda "tipi boş
  // olanlar" gibi yorumlanabilir ve liste sessizce yanlış olurdu.
  if (params.search) search.set("search", params.search);
  if (params.type) search.set("type", params.type);
  if (params.region) search.set("region", params.region);
  if (params.country) search.set("country", params.country);

  search.set("page", String(page));
  search.set("limit", String(PAGE_SIZE));

  return `/api/whiskeys?${search.toString()}`;
}
