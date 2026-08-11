import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import { addToWishlist, removeFromWishlist, type WishlistPage } from "./wishlist-cache";
import type { Whiskey } from "./whiskeys";

/**
 * @file wishlist.ts
 * @description İstek listesine erişimin tek yolu.
 *
 * Kişisel veri: her istek oturum token'ı taşıyor. Ekranlar apiRequest görmez
 * (bkz. whiskeys.ts'teki gerekçe).
 */

interface WishlistStatus {
  wishlisted: boolean;
}

/**
 * Listenin tamamı.
 *
 * Sunucu `limit`'i 100'de tavanlıyor; sayfalama eklenmedi çünkü istek listesi
 * doğası gereği küçük ve kullanıcı 100'ün üstüne çıkarsa da liste ekranı
 * doğru çalışır — eksik kalan yalnızca en eski kayıtlar olur. Detay
 * ekranındaki düğme bu listeye BAKMIYOR, kendi ucundan soruyor, yani o
 * durumda bile yanlış durum göstermez.
 */
export function useWishlist() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.wishlist.list(),
    queryFn: () => apiRequest<WishlistPage>("/api/wishlist?limit=100", { token }),
    enabled: Boolean(token),
  });
}

/** Tek viskinin durumu — katalog detayındaki düğme için. */
export function useIsWishlisted(whiskeyId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.wishlist.status(whiskeyId),
    queryFn: () => apiRequest<WishlistStatus>(`/api/wishlist/${whiskeyId}`, { token }),
    enabled: Boolean(token) && whiskeyId.length > 0,
  });
}

/**
 * Ekle / kaldır — İYİMSER.
 *
 * Web'deki düğme sunucuyu bekliyor; mobilde beklemiyor, beğeni düğmesiyle aynı
 * gerekçe: dokunup bekleyen bir yer imi bozuk hissettiriyor. İstek başarısız
 * olursa önbellek eski hâline döner ve sunucudan tazelenir.
 *
 * Listeye eklerken viskinin kendisi gerekiyor, o yüzden çağıran onu geçiyor —
 * detay ekranında zaten elde.
 */
export function useToggleWishlist() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ whiskey, wishlisted }: { whiskey: Whiskey; wishlisted: boolean }) =>
      apiRequest<WishlistStatus>(`/api/wishlist/${whiskey.id}`, {
        method: wishlisted ? "DELETE" : "POST",
        token,
      }),

    onMutate: async ({ whiskey, wishlisted }) => {
      const statusKey = queryKeys.wishlist.status(whiskey.id);
      const listKey = queryKeys.wishlist.list();

      // Uçuştaki tazeleme, az sonra yazacağımız iyimser değeri ezmesin.
      await queryClient.cancelQueries({ queryKey: statusKey });
      await queryClient.cancelQueries({ queryKey: listKey });

      const previousStatus = queryClient.getQueryData<WishlistStatus>(statusKey);
      const previousList = queryClient.getQueryData<WishlistPage>(listKey);

      queryClient.setQueryData<WishlistStatus>(statusKey, { wishlisted: !wishlisted });
      queryClient.setQueryData<WishlistPage | undefined>(listKey, (cached) =>
        wishlisted
          ? removeFromWishlist(cached, whiskey.id)
          : addToWishlist(cached, whiskey, new Date().toISOString())
      );

      return { previousStatus, previousList, whiskeyId: whiskey.id };
    },

    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKeys.wishlist.status(context.whiskeyId), context.previousStatus);
      queryClient.setQueryData(queryKeys.wishlist.list(), context.previousList);
    },

    onSettled: () => {
      // Sıralama ve toplam sunucudan gelsin — iyimser kopya yakın, birebir değil.
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });
}
