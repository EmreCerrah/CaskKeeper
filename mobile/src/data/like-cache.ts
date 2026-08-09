/**
 * @file like-cache.ts
 * @description Beğeni sayısını önbellekte yerinde günceller — SAF.
 *
 * Beğeni iyimser uygulanıyor: ağ turunu bekleyen bir kalp bozuk hissettiriyor.
 * Ama akış `useInfiniteQuery` ile SAYFALAR hâlinde duruyor, yani doğru notu
 * bulmak için sayfalarda gezmek gerekiyor ve yanlış sayfayı bozmak kolay.
 * O yüzden dönüşüm burada, ağdan ayrı ve sınanabilir.
 *
 * Kural: yalnızca hedef not değişir. Diğer notlar, sayfa sınırları, toplam
 * sayılar ve sıralama olduğu gibi kalır.
 */

export interface Interactions {
  likeCount: number;
  commentCount: number;
  isLikedByViewer: boolean;
}

export interface LikeableNote {
  id: string;
  interactions?: Interactions;
}

export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InfiniteData<T> {
  pages: Page<T>[];
  pageParams: unknown[];
}

/**
 * Tek bir notun beğeni durumunu ters çevirir.
 *
 * Dönüş tipinde `interactions` ARTIK isteğe bağlı değil: bilgi hiç yokken bile
 * fonksiyon onu üretiyor, dolayısıyla çağıranın tekrar boşluk kontrolü
 * yapması gerekmiyor.
 */
export function toggleLikeOnNote<T extends LikeableNote>(note: T): T & { interactions: Interactions } {
  const current = note.interactions ?? { likeCount: 0, commentCount: 0, isLikedByViewer: false };
  const liked = !current.isLikedByViewer;

  return {
    ...note,
    interactions: {
      ...current,
      isLikedByViewer: liked,
      // Sayı asla negatife düşmemeli: sunucu ile önbellek bir an ayrışırsa
      // ekranda "-1 beğeni" görünmesin.
      likeCount: Math.max(0, current.likeCount + (liked ? 1 : -1)),
    },
  };
}

/** Sayfalı akış önbelleğinde hedef notu bulup günceller. */
export function toggleLikeInPages<T extends LikeableNote>(
  cached: InfiniteData<T> | undefined,
  noteId: string
): InfiniteData<T> | undefined {
  if (!cached) return cached;

  return {
    ...cached,
    pages: cached.pages.map((page) => ({
      ...page,
      data: page.data.map((note) => (note.id === noteId ? toggleLikeOnNote(note) : note)),
    })),
  };
}
