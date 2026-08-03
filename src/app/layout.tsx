import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";

/**
 * Kök layout — bilinçli olarak oturumdan bağımsızdır.
 *
 * Navbar oturumu sunucuda okuyor; burada dursaydı uygulamadaki HER sayfa
 * kullanıcıya özel ve dinamik olurdu ve çevrimdışı açılabilecek tek bir sayfa
 * bile kalmazdı. Oturuma bağlı çerçeve bu yüzden (main)/layout.tsx'e taşındı.
 * Bu sayede (main) dışındaki /cevrimdisi statik render edilebiliyor, service
 * worker onu önbelleğe alabiliyor ve bağlantı yokken sunabiliyor.
 *
 * Route grupları URL'leri etkilemez: (main)/viskiler yine /viskiler'dir.
 */

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin", "latin-ext"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: {
    default: "CaskKeeper — Viski Tadım Günlüğünüz",
    template: "%s | CaskKeeper",
  },
  description:
    "Viskileri keşfedin, tadım deneyimlerinizi kaydedin, zaman içinde karşılaştırın. Premium viski tadım günlüğü.",
  applicationName: "CaskKeeper",
  // iOS manifest'i yok sayar; ana ekrana eklenen uygulamanın tam ekran açılması
  // ve başlık çubuğunun temayla uyumlu olması için bu ayarlar gerekir.
  appleWebApp: {
    capable: true,
    title: "CaskKeeper",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  // viewport-fit=cover olmadan env(safe-area-inset-*) her zaman 0 döner;
  // MobileNav alt çubuğu bunu kullanıyor. Standalone modda (adres çubuğu yokken)
  // bu olmadan içerik iOS ana ekran göstergesinin altında kalır.
  viewportFit: "cover",
  themeColor: "#14100c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
