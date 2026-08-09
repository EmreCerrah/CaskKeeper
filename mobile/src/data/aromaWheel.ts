import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { queryKeys } from "./keys";

/**
 * @file aromaWheel.ts
 * @description Aroma kategorileri — sunucudan.
 *
 * Liste mobile KOPYALANMIYOR: etiketler veritabanına olduğu gibi metin olarak
 * yazılıyor ve istatistikler onları eşleştiriyor. Kopya olsaydı web'de bir
 * etiket değiştiğinde iki istemci farklı metin üretmeye başlar, kimse hata
 * görmez, sadece istatistikler yanlış olurdu.
 */

export interface AromaCategory {
  /** "fruity", "smoky_peaty" … — başlığı istemci bu kimlikten çeviriyor. */
  category: string;
  /** Saklanan değerler. ASLA çevrilmez, olduğu gibi gönderilir. */
  tags: string[];
}

export function useAromaWheel() {
  return useQuery({
    queryKey: queryKeys.aromaWheel(),
    queryFn: () => apiRequest<AromaCategory[]>("/api/aroma-wheel"),
    // Sabitten okunuyor, pratikte hiç değişmiyor.
    staleTime: Infinity,
  });
}
