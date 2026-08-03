import Link from "next/link";
import { GlassWater } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

/**
 * Hiçbir route ile eşleşmeyen adresler için 404.
 *
 * Kök layout'ta artık gezinme çerçevesi yok (bkz. layout.tsx), bu yüzden
 * çerçeve burada açıkça render ediliyor — aksi halde 404 sayfası navbar'sız
 * kalırdı. (main) altındaki sayfalar çerçeveyi kendi layout'undan alır.
 */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
          <GlassWater className="h-12 w-12 text-primary/50" aria-hidden />
          <h1 className="font-serif text-3xl font-bold">Sayfa Bulunamadı</h1>
          <p className="max-w-md text-muted-foreground">
            Aradığınız sayfa fıçıda dinlenmeye bırakılmış olabilir. Kataloğa dönüp keşfetmeye devam edin.
          </p>
          <Button asChild>
            <Link href="/viskiler">Kataloğa Dön</Link>
          </Button>
        </div>
      </main>
      <Footer />
      <div className="h-[calc(56px+env(safe-area-inset-bottom))] md:hidden" aria-hidden />
      <MobileNav />
    </>
  );
}
