import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Columns3 } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { whiskeyService } from "@/server/services/WhiskeyService";
import { Button } from "@/components/ui/button";
import { WhiskeyCard } from "@/components/whiskey/WhiskeyCard";
import { WhiskeyFilters } from "@/components/whiskey/WhiskeyFilters";
import { Pagination } from "@/components/shared/Pagination";

export const metadata: Metadata = { title: "Viski Kataloğu" };
export const dynamic = "force-dynamic";

interface CatalogPageProps {
  searchParams: {
    arama?: string;
    tip?: string;
    bolge?: string;
    ulke?: string;
    sayfa?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  await connectToDatabase();

  const page = Math.max(1, Number(searchParams.sayfa) || 1);

  const [result, facets] = await Promise.all([
    whiskeyService.getAllWhiskeys(
      {
        search: searchParams.arama,
        type: searchParams.tip,
        region: searchParams.bolge,
        country: searchParams.ulke,
      },
      { page, limit: 24, sortBy: "brand", sortOrder: "asc" }
    ),
    whiskeyService.getFacets(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold">Viski Kataloğu</h1>
          <p className="text-muted-foreground">
            {result.total > 0
              ? `${result.total} viski arasından keşfedin.`
              : "Katalog şu an boş görünüyor."}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/karsilastir">
            <Columns3 className="h-4 w-4" aria-hidden />
            Karşılaştır
          </Link>
        </Button>
      </div>

      <Suspense>
        <WhiskeyFilters facets={facets} />
      </Suspense>

      {result.data.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.data.map((whiskey) => (
              <WhiskeyCard key={whiskey.id} whiskey={whiskey} />
            ))}
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/viskiler"
            searchParams={{
              arama: searchParams.arama,
              tip: searchParams.tip,
              bolge: searchParams.bolge,
              ulke: searchParams.ulke,
            }}
          />
        </>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <p className="font-medium">Aradığınız kriterlere uygun viski bulunamadı.</p>
          <p className="mt-1 text-sm">Filtreleri temizleyip tekrar deneyin.</p>
        </div>
      )}
    </div>
  );
}
