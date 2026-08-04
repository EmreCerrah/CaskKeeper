import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { getLocale, getTranslations } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";

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

export function generateMetadata(): Metadata {
  const t = getTranslations();

  return {
    title: {
      default: t("meta.title"),
      template: "%s | CaskKeeper",
    },
    description: t("meta.description"),
    applicationName: "CaskKeeper",
    // iOS manifest'i yok sayar; ana ekrana eklenen uygulamanın tam ekran
    // açılması ve başlık çubuğunun temayla uyumlu olması için bu ayarlar gerekir.
    appleWebApp: {
      capable: true,
      title: "CaskKeeper",
      statusBarStyle: "black-translucent",
    },
  };
}

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
  // lang sabit "tr" değil: ekran okuyucular telaffuzu, tarayıcılar çeviri
  // teklifini buna göre belirliyor.
  const locale = getLocale();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <LocaleProvider locale={locale}>
          {children}
          <ServiceWorkerRegistrar />
        </LocaleProvider>
      </body>
    </html>
  );
}
