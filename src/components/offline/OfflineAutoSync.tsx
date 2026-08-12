"use client";

import { useEffect } from "react";
import { isOfflineEnabled, subscribeOfflinePreference } from "@/lib/offline/preference";
import { clearOfflineSnapshot } from "@/lib/offline/store";
import { subscribeOfflineDataChanged, syncOfflineSnapshot } from "@/lib/offline/sync";

interface OfflineAutoSyncProps {
  userId: string;
  userName: string;
}

/**
 * Anahtar açıkken çevrimdışı kopyayı güncel tutar. Görsel çıktısı yoktur.
 *
 * Üç tetikleyici: uygulama açılışı, sekmeye geri dönüş ve veriyi değiştiren
 * işlemler (notifyOfflineDataChanged). syncOfflineSnapshot kendi içinde hem
 * eşzamanlı çağrıları teke indirir hem de asgari aralık uygular, bu yüzden
 * buradan sık tetiklenmesi sorun değildir.
 *
 * (main)/layout.tsx içinde yalnızca oturum açıkken render edilir.
 */
export function OfflineAutoSync({ userId, userName }: OfflineAutoSyncProps) {
  useEffect(() => {
    let cancelled = false;

    /**
     * @param force Kullanıcının bilinçli bir eylemi sonrası mı tetiklendi.
     * Açılış/sekmeye dönüş gibi arka plan tetiklemeleri asgari aralık kuralına
     * tabidir; ama kullanıcı not yazdıysa veya istek listesini değiştirdiyse
     * senkron ertelenemez — o an çevrimdışı kalırsa değişiklik kopyaya girmemiş
     * olurdu.
     */
    const run = (force = false) => {
      if (cancelled || !isOfflineEnabled()) return;
      // Senkron başarısız olursa sessiz kalınır: bu arka plan işi, kullanıcının
      // o an yaptığı işi kesmemeli. Durum /profile'deki kartta görünür.
      syncOfflineSnapshot({ userId, userName, force }).catch(() => {});
    };

    if (isOfflineEnabled()) {
      run();
    } else {
      // "Kapalıysa hiçbir şey saklanmaz" kuralı geçmişte kalan kayıtları da
      // kapsar: anahtar kapalıyken bulunan bir kopya (ör. tarayıcı verisi elle
      // taşınmış ya da eski sürümden kalmış) burada temizlenir.
      clearOfflineSnapshot().catch(() => {});
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };

    document.addEventListener("visibilitychange", onVisible);
    const unsubscribeData = subscribeOfflineDataChanged(() => run(true));
    // Anahtar açıldığında OfflineToggle zaten senkronu başlatır; burada
    // dinlemek başka bir sekmede açılma durumunu da kapsar.
    const unsubscribePreference = subscribeOfflinePreference((enabled) => {
      if (enabled) run(true);
      else clearOfflineSnapshot().catch(() => {});
    });

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      unsubscribeData();
      unsubscribePreference();
    };
  }, [userId, userName]);

  return null;
}
