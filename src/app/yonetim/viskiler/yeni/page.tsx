import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhiskeyForm } from "@/components/admin/WhiskeyForm";

export const metadata: Metadata = { title: "Yeni Viski" };

export default function NewWhiskeyPage() {
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/yonetim/viskiler">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kataloğa Dön
        </Link>
      </Button>

      <div>
        <h2 className="font-serif text-2xl font-bold">Kataloğa Yeni Viski Ekle</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Slug marka, ürün adı ve damıtımevinden otomatik üretilir.
        </p>
      </div>

      <WhiskeyForm />
    </div>
  );
}
