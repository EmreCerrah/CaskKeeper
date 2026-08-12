/**
 * @file interaction-cache.ts
 * @description Bir notun beğeni ve yorum sayılarını önbellekte yerinde
 * günceller — SAF.
 *
 * Beğeni iyimser uygulanıyor: ağ turunu bekleyen bir kalp bozuk hissettiriyor.
 * Ama akış `useInfiniteQuery` ile SAYFALAR hâlinde duruyor, yani doğru notu
 * bulmak için sayfalarda gezmek gerekiyor ve yanlış sayfayı bozmak kolay.
 * O yüzden dönüşüm burada, ağdan ayrı ve sınanabilir.
 *
 * Yorum sayısı da aynı `interactions` nesnesinde ve aynı iki önbellekte
 * duruyor; ikinci bir sayfa gezme kopyası çıkmasın diye o da burada. Dosya
 * eskiden `like-cache.ts` idi, adı bu yüzden genişledi.
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

/**
 * Yorum sayısını `delta` kadar kaydırır.
 *
 * Yorumun KENDİSİ iyimser eklenmiyor (bkz. comments.ts) — sunucudan gerçek
 * yorum dönüyor. Ama sayı akış kartında da yazıyor ve orası ayrı bir önbellek;
 * dokunulmazsa kart "2 yorum" derken altında üç yorum görünür.
 */
export function adjustCommentCount<T extends LikeableNote>(
  note: T,
  delta: number
): T & { interactions: Interactions } {
  const current = note.interactions ?? { likeCount: 0, commentCount: 0, isLikedByViewer: false };

  return {
    ...note,
    interactions: {
      ...current,
      // Beğenideki koruma: ekranda "-1 yorum" görünmesin.
      commentCount: Math.max(0, current.commentCount + delta),
    },
  };
}

/** Sayfalı akış önbelleğinde hedef notun yorum sayısını kaydırır. */
export function adjustCommentCountInPages<T extends LikeableNote>(
  cached: InfiniteData<T> | undefined,
  noteId: string,
  delta: number
): InfiniteData<T> | undefined {
  if (!cached) return cached;

  return {
    ...cached,
    pages: cached.pages.map((page) => ({
      ...page,
      data: page.data.map((note) => (note.id === noteId ? adjustCommentCount(note, delta) : note)),
    })),
  };
}
