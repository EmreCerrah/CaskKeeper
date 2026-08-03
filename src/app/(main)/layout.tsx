import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

/**
 * Uygulama çerçevesi — oturuma bağlı olan kısım.
 *
 * Navbar bir server component olarak oturumu okur, dolayısıyla bu layout'un
 * altındaki her sayfa kullanıcıya özeldir ve dinamik render edilir. Bu yüzden
 * kök layout'ta değil burada duruyor; (main) dışında kalan /cevrimdisi böylece
 * statik kalabiliyor.
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Mobil alt sekme çubuğu sabit konumlu; içerik altında kalmasın diye
          sayfa altına çubuk yüksekliği kadar boşluk bırakılır. */}
      <div className="h-[calc(56px+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
      <MobileNav />
    </>
  );
}
