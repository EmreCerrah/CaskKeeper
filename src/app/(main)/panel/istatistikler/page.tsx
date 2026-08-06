import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { analyticsService } from "@/server/services/AnalyticsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DistributionBars } from "@/components/analytics/DistributionBars";
import { FlavorTrendChart } from "@/components/analytics/FlavorTrendChart";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("stats.title") };
}
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/panel/istatistikler");

  await connectToDatabase();
  const analytics = await analyticsService.getAnalytics(session.userId);

  const t = getTranslations();

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <Link
          href="/panel"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {t("dashboard.back")}
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold">{t("stats.title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("stats.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">{t("stats.trendTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <FlavorTrendChart trend={analytics.flavorTrend} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("stats.byType")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionBars
              items={analytics.distribution.byType}
              emptyLabel={t("stats.empty")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("stats.byRegion")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionBars
              items={analytics.distribution.byRegion}
              emptyLabel={t("stats.empty")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.topDistilleries")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionBars
              items={analytics.distribution.byDistillery}
              emptyLabel={t("stats.empty")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
