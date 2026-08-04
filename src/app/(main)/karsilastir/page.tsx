import type { Metadata } from "next";
import Link from "next/link";
import { Columns3 } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { whiskeyService } from "@/server/services/WhiskeyService";
import { Button } from "@/components/ui/button";
import { ComparePicker } from "@/components/whiskey/ComparePicker";
import { ComparisonTable } from "@/components/whiskey/ComparisonTable";
import { MAX_COMPARE_ITEMS, parseCompareSlugs } from "@/lib/utils/comparison";
import { getTranslations } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("compare.title") };
}
export const dynamic = "force-dynamic";

interface ComparePageProps {
  searchParams: { viski?: string | string[] };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  await connectToDatabase();

  const slugs = parseCompareSlugs(searchParams.viski);
  const whiskeys = await whiskeyService.getWhiskeysBySlugs(slugs);
  const t = getTranslations();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold">{t("compare.title")}</h1>
        <p className="text-muted-foreground">
          {t("compare.subtitle", { max: MAX_COMPARE_ITEMS })}
        </p>
      </div>

      <ComparePicker selectedSlugs={whiskeys.map((w) => w.slug)} />

      {whiskeys.length > 0 ? (
        <ComparisonTable whiskeys={whiskeys} />
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <Columns3 className="mx-auto mb-3 h-10 w-10 text-primary/50" aria-hidden />
          <p className="font-medium">{t("compare.empty")}</p>
          <p className="mt-1 text-sm">{t("compare.emptyHint")}</p>
          <Button asChild className="mt-4">
            <Link href="/viskiler">{t("compare.exploreCatalogue")}</Link>
          </Button>
        </div>
      )}

      {whiskeys.length === 1 && (
        <p className="text-sm text-muted-foreground">{t("compare.addOneMore")}</p>
      )}
    </div>
  );
}
