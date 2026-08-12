import type { Whiskey } from "./whiskeys";

/**
 * @file wishlist-cache.ts
 * @description İstek listesi önbelleğini yerinde günceller — SAF.
 *
 * Ekleme/kaldırma iyimser uygulanıyor (bkz. wishlist.ts), yani liste
 * önbelleğine elle dokunuluyor. Liste içeriğinin YANINDA bir de `total`
 * taşıyor: biri güncellenip diğeri unutulduğunda ekranda "3 viski" yazarken
 * iki kart görünür ve bu hiçbir yerde hata vermez. O yüzden dönüşüm ağdan
 * ayrı ve testli — interaction-cache.ts ile aynı gerekçe.
 */

export interface WishlistItem {
  whiskey: Whiskey;
  /** Listeye eklendiği an (ISO). */
  addedAt: string;
}

export interface WishlistPage {
  data: WishlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Viskiyi listeden çıkarır ve toplamı bir azaltır.
 *
 * Listede yoksa hiçbir şey değişmez: kullanıcı listeyi bir ekranda açıkken
 * başka bir cihazdan kaldırmış olabilir, o durumda toplamı bir eksiltmek
 * sayıyı gerçekten yanlış yapardı.
 */
export function removeFromWishlist(
  cached: WishlistPage | undefined,
  whiskeyId: string
): WishlistPage | undefined {
  if (!cached) return cached;

  const data = cached.data.filter((item) => item.whiskey.id !== whiskeyId);
  if (data.length === cached.data.length) return cached;

  return { ...cached, data, total: Math.max(0, cached.total - 1) };
}

/**
 * Viskiyi listenin BAŞINA ekler ve toplamı bir artırır.
 *
 * Başa, çünkü sunucu eklenme tarihine göre azalan sıralıyor
 * (WishlistRepository.findByUser) — sona eklemek, tazelemeden sonra kartın
 * gözden kaybolup listenin başında yeniden belirmesi demek olurdu.
 */
export function addToWishlist(
  cached: WishlistPage | undefined,
  whiskey: Whiskey,
  addedAt: string
): WishlistPage | undefined {
  if (!cached) return cached;
  // Zaten varsa dokunma: çift dokunuş ya da uçuştaki bir tazeleme yüzünden
  // aynı viski iki kez görünmesin.
  if (cached.data.some((item) => item.whiskey.id === whiskey.id)) return cached;

  return {
    ...cached,
    data: [{ whiskey, addedAt }, ...cached.data],
    total: cached.total + 1,
  };
}
