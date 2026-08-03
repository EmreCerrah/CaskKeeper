"use client";

import { useEffect } from "react";

/**
 * Service worker'ı kaydeder. Görsel çıktısı yoktur.
 *
 * Yalnızca üretim derlemesinde kaydedilir: geliştirmede HMR ile araya giren bir
 * service worker bayat varlık sunabilir. Geliştirme ortamında daha önce kalmış
 * bir kayıt varsa temizlenir, aksi halde bir kez üretim derlemesi çalıştırmış
 * olan geliştiricinin tarayıcısında kalıcı olarak takılı kalırdı.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    // Kayıt, sayfanın ilk yüklenmesiyle yarışmasın diye load sonrasına bırakılır.
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service worker kaydedilemedi:", error);
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
