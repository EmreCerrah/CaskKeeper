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
import { getTranslations } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("catalogue.title") };
}
export const dynamic = "force-dynamic";

interface CatalogPageProps {
  searchParams: {
    search?: string;
    type?: string;
    region?: string;
    country?: string;
    page?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  await connectToDatabase();

  const page = Math.max(1, Number(searchParams.page) || 1);

  const [result, facets] = await Promise.all([
    whiskeyService.getAllWhiskeys(
      {
        search: searchParams.search,
        type: searchParams.type,
        region: searchParams.region,
        country: searchParams.country,
      },
      { page, limit: 24, sortBy: "brand", sortOrder: "asc" }
    ),
    whiskeyService.getFacets(),
  ]);

  const t = getTranslations();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold">{t("catalogue.title")}</h1>
          <p className="text-muted-foreground">
            {result.total > 0
              ? t("catalogue.count", { count: result.total })
              : t("catalogue.empty")}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/compare">
            <Columns3 className="h-4 w-4" aria-hidden />
            {t("nav.compare")}
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
            basePath="/whiskeys"
            searchParams={{
              search: searchParams.search,
              type: searchParams.type,
              region: searchParams.region,
              country: searchParams.country,
            }}
          />
        </>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <p className="font-medium">{t("catalogue.noResults")}</p>
          <p className="mt-1 text-sm">{t("catalogue.clearFilters")}</p>
        </div>
      )}
    </div>
  );
}
