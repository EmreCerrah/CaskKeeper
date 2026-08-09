import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/response";

/**
 * @file queryClient.ts
 * @description Uygulamanın tek QueryClient'ı.
 *
 * Çevrimdışı desteği ileride BURAYA girecek: kalıcı bir depo takılıp
 * `persistQueryClient` ile bağlanacak, ekranlar hiç değişmeyecek. Ayarların
 * bugünkü hâli de o günü düşünerek seçildi — özellikle `gcTime`, önbelleğin
 * diske yazılmadan çöpe atılmaması için uzun tutuluyor.
 */

/** Katalog neredeyse hiç değişmiyor; tazeliği dakikalarla ölçmek yeterli. */
const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES,
        gcTime: ONE_DAY,

        // Kimlik hataları tekrar denenmez: token süresi dolmuşsa üç kez daha
        // sormanın anlamı yok, kullanıcı yeniden giriş yapmalı.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
            return false;
          }
          return failureCount < 2;
        },

        // Mobilde ekrana her dönüşte ağa çıkmak pili yorar; veri zaten
        // staleTime boyunca taze sayılıyor.
        refetchOnWindowFocus: false,
      },
    },
  });
}
