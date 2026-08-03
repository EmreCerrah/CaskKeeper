import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { OfflineAutoSync } from "@/components/offline/OfflineAutoSync";

/**
 * Uygulama çerçevesi — oturuma bağlı olan kısım.
 *
 * Navbar bir server component olarak oturumu okur, dolayısıyla bu layout'un
 * altındaki her sayfa kullanıcıya özeldir ve dinamik render edilir. Bu yüzden
 * kök layout'ta değil burada duruyor; (main) dışında kalan /cevrimdisi böylece
 * statik kalabiliyor.
 */
export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Mobil alt sekme çubuğu sabit konumlu; içerik altında kalmasın diye
          sayfa altına çubuk yüksekliği kadar boşluk bırakılır. */}
      <div className="h-[calc(56px+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
      <MobileNav />
      {/* Çevrimdışı anahtarı açıksa kopyayı güncel tutar; kapalıysa hiçbir şey
          yapmaz. Yalnızca oturum açıkken anlamlı. */}
      {session && <OfflineAutoSync userId={session.userId} userName={session.name} />}
    </>
  );
}
