import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import Constants from "expo-constants";
import { shouldPersistQuery } from "./persist-rules";

/**
 * @file persist.ts
 * @description Sorgu önbelleğinin diske yazılması.
 *
 * Ekranların hiçbiri bunu bilmiyor — Dilim 2'de veri katmanı tam olarak bunun
 * için kurulmuştu: çevrimdışı desteği o katmanın içine girsin, ekranlar
 * değişmesin.
 *
 * Neyin yazılacağı persist-rules.ts'te ve testli; orası bir gizlilik sınırı.
 */

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "caskkeeper.query-cache",
});

export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister,

  // Yedi gün: katalog neredeyse hiç değişmiyor, notlar da kullanıcının kendi
  // verisi. Bundan eskisi sessizce atılır ve ağdan yeniden alınır.
  maxAge: SEVEN_DAYS,

  // Uygulama sürümü değişince eski önbellek düşer. Veri şekli bir sürümde
  // değişirse, eski kayıtların yeni ekranlara sızmasını bu engelliyor.
  buster: Constants.expoConfig?.version ?? "dev",

  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      // Yalnızca başarılı sorgular: hata durumunu diske yazıp sonraki açılışta
      // "hata" göstermek anlamsız olurdu.
      query.state.status === "success" && shouldPersistQuery(query.queryKey),
  },
};

/**
 * Cihazdaki kopyayı siler.
 *
 * Çıkışta çağrılıyor: kalıcı önbellekte kullanıcının kendi tadım notları var ve
 * aynı cihaza giren bir sonraki kişi onları devralmamalı. Web tarafında
 * logout-client.ts aynı şeyi aynı gerekçeyle yapıyor.
 */
export async function clearPersistedCache(): Promise<void> {
  await persister.removeClient();
}
