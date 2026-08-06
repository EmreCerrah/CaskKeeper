import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { recommendationService } from "@/server/services/RecommendationService";
import { Button } from "@/components/ui/button";
import { WhiskeyCard } from "@/components/whiskey/WhiskeyCard";
import { MatchInfo } from "@/components/recommendations/MatchInfo";
import { getTranslations } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("recommendations.title") };
}
export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/panel/oneriler");

  await connectToDatabase();
  const recommendations = await recommendationService.getRecommendations(session.userId);

  const t = getTranslations();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <Link
          href="/panel"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {t("dashboard.back")}
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold">{t("recommendations.title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("recommendations.subtitle")}
        </p>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((rec) => (
            <WhiskeyCard
              key={rec.whiskey.id}
              whiskey={rec.whiskey}
              footer={<MatchInfo score={rec.score} matchedCategories={rec.matchedCategories} />}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-primary/50" aria-hidden />
          <p className="font-medium">{t("recommendations.empty")}</p>
          <p className="mt-1 text-sm">
            {t("recommendations.emptyHint")}
          </p>
          <Button asChild className="mt-4">
            <Link href="/viskiler">{t("compare.exploreCatalogue")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
