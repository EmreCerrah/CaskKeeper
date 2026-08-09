import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { queryKeys, type WhiskeyListParams } from "./keys";
import { buildListQuery } from "./list-query";

/**
 * @file whiskeys.ts
 * @description Katalog verisine erişimin TEK yolu.
 *
 * Ekranlar apiRequest'i doğrudan çağırmaz; buradaki hook'ları kullanır. Sebebi
 * çevrimdışı: kalıcılık eklendiğinde değişecek yer burası olacak, ekranlar
 * değil. Web tarafındaki "veritabanına yalnızca repository'den erişilir"
 * kuralının istemci karşılığı.
 */

/**
 * Sunucunun WhiskeyDTO'sundan mobilin kullandığı alanlar.
 *
 * BİLEREK kopya: mobil, web'in `src/lib/types/dto.ts` dosyasını import etmiyor
 * (ayrı repoya taşınacak). Sözleşme tek yönlü — sunucu alan eklerse burası
 * bozulmaz, alan kaldırırsa derleme değil çalışma zamanı bozulur; onu da
 * ekranlar isteğe bağlı alanlarla karşılıyor.
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

/** Katalog listesi — sonsuz kaydırma. */
export function useWhiskeys(params: WhiskeyListParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.whiskeys.list(params),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => apiRequest<PaginatedWhiskeys>(buildListQuery(params, pageParam)),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

/** Tek viski (detay ekranı). */
export function useWhiskey(slug: string) {
  return useQuery({
    queryKey: queryKeys.whiskeys.detail(slug),
    queryFn: () => apiRequest<Whiskey>(`/api/whiskeys/${slug}`),
    enabled: slug.length > 0,
  });
}

/**
 * Filtre menüsünün değerleri.
 *
 * Katalogda gerçekten bulunan tip/bölge/ülke listesi — elle yazılmış bir liste
 * kataloğa yeni bir bölge girdiğinde sessizce eksik kalırdı.
 */
export function useFacets() {
  return useQuery({
    queryKey: queryKeys.whiskeys.facets(),
    queryFn: () => apiRequest<WhiskeyFacets>("/api/whiskeys/facets"),
  });
}

