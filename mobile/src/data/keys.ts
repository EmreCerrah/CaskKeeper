/**
 * @file keys.ts
 * @description Sorgu anahtarları tek yerde.
 *
 * Dağınık bırakılsa her ekran kendi dizisini uydururdu ve iki ekran aynı veriyi
 * farklı anahtarla isteyip iki kez çekerdi. Daha önemlisi: çevrimdışı kalıcılık
 * eklendiğinde "neyi saklayacağız" sorusu bu anahtarlar üzerinden cevaplanacak,
 * yani derli toplu olmaları gerekiyor.
 */

export interface WhiskeyListParams {
  search?: string;
  type?: string;
  region?: string;
  country?: string;
}

export const queryKeys = {
  whiskeys: {
    all: ["whiskeys"] as const,
    list: (params: WhiskeyListParams) => ["whiskeys", "list", params] as const,
    detail: (slug: string) => ["whiskeys", "detail", slug] as const,
    facets: () => ["whiskeys", "facets"] as const,
  },
  tastingNotes: {
    /** Yazma sonrası tüm not önbelleğini geçersizleştirmek için ortak kök. */
    all: ["tastingNotes"] as const,
    mine: () => ["tastingNotes", "mine"] as const,
    detail: (id: string) => ["tastingNotes", "detail", id] as const,
  },
  aromaWheel: () => ["aromaWheel"] as const,
  feed: () => ["feed"] as const,
  users: {
    /** Takip değişince arama sonuçlarındaki durumlar da tazelenmeli. */
    all: ["users"] as const,
    search: (query: string) => ["users", "search", query] as const,
    profile: (id: string) => ["users", "profile", id] as const,
    notes: (id: string) => ["users", "notes", id] as const,
  },
} as const;
