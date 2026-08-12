import type { MetadataRoute } from "next";

/**
 * Web App Manifest — Next.js bunu `/manifest.webmanifest` olarak yayınlar ve
 * <link rel="manifest"> etiketini otomatik ekler.
 *
 * İkonlar `npm run icons:generate` ile üretilip depoya commit edilir.
 * Renkler globals.css'teki tema değişkenleriyle uyumludur
 * (--background: 24 30% 5%, --primary: 36 92% 55%).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CaskKeeper — Viski Tadım Günlüğü",
    short_name: "CaskKeeper",
    description:
      "Viskileri keşfedin, tadım deneyimlerinizi kaydedin, damak zevkinizin zaman içinde nasıl değiştiğini görün.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#14100c",
    theme_color: "#14100c",
    lang: "tr",
    dir: "ltr",
    categories: ["food", "lifestyle", "social"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Android ikonu kendi maskesiyle kırpar; bu sürümde içerik güvenli
        // bölgeye sığdırılmış ve arka plan kenarlara kadar doldurulmuştur.
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Yeni tadım notu",
        short_name: "Yeni tadım",
        url: "/my-tastings/new",
      },
      {
        name: "Viskiler",
        short_name: "Viskiler",
        url: "/whiskeys",
      },
      {
        name: "Akış",
        short_name: "Akış",
        url: "/feed",
      },
    ],
  };
}
