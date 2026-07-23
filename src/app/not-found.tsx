import Link from "next/link";
import { GlassWater } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
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
  );
}
