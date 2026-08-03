import type { Metadata } from "next";
import Link from "next/link";
import { Columns3 } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { whiskeyService } from "@/server/services/WhiskeyService";
import { Button } from "@/components/ui/button";
import { ComparePicker } from "@/components/whiskey/ComparePicker";
import { ComparisonTable } from "@/components/whiskey/ComparisonTable";
import { MAX_COMPARE_ITEMS, parseCompareSlugs } from "@/lib/utils/comparison";

export const metadata: Metadata = { title: "Viski Karşılaştırma" };
export const dynamic = "force-dynamic";

interface ComparePageProps {
  searchParams: { viski?: string | string[] };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  await connectToDatabase();

  const slugs = parseCompareSlugs(searchParams.viski);
  const whiskeys = await whiskeyService.getWhiskeysBySlugs(slugs);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold">Viski Karşılaştırma</h1>
        <p className="text-muted-foreground">
          En fazla {MAX_COMPARE_ITEMS} viskiyi yan yana inceleyin. Ortak aroma notaları
          vurgulanır.
        </p>
      </div>

      <ComparePicker selectedSlugs={whiskeys.map((w) => w.slug)} />

      {whiskeys.length > 0 ? (
        <ComparisonTable whiskeys={whiskeys} />
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <Columns3 className="mx-auto mb-3 h-10 w-10 text-primary/50" aria-hidden />
          <p className="font-medium">Karşılaştırma henüz boş.</p>
          <p className="mt-1 text-sm">
            Yukarıdaki arama kutusundan viski ekleyin ya da katalogdan bir viski seçip
            &ldquo;Karşılaştır&rdquo; butonunu kullanın.
          </p>
          <Button asChild className="mt-4">
            <Link href="/viskiler">Kataloğu Keşfet</Link>
          </Button>
        </div>
      )}

      {whiskeys.length === 1 && (
        <p className="text-sm text-muted-foreground">
          Ortak aroma notalarını görmek için en az bir viski daha ekleyin.
        </p>
      )}
    </div>
  );
}
