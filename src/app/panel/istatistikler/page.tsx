import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { analyticsService } from "@/server/services/AnalyticsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DistributionBars } from "@/components/analytics/DistributionBars";
import { FlavorTrendChart } from "@/components/analytics/FlavorTrendChart";

export const metadata: Metadata = { title: "Detaylı İstatistikler" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/panel/istatistikler");

  await connectToDatabase();
  const analytics = await analyticsService.getAnalytics(session.userId);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <Link
          href="/panel"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Panelime dön
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold">Detaylı İstatistikler</h1>
        <p className="mt-1 text-muted-foreground">
          Damak zevkinizin zaman içindeki değişimi ve katalog tercihleriniz.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Zaman İçinde Aroma Değişimi</CardTitle>
        </CardHeader>
        <CardContent>
          <FlavorTrendChart trend={analytics.flavorTrend} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Tipe Göre</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionBars
              items={analytics.distribution.byType}
              emptyLabel="Henüz tadım notunuz yok."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Bölgeye Göre</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionBars
              items={analytics.distribution.byRegion}
              emptyLabel="Henüz tadım notunuz yok."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Çok Tadılan Damıtımevleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionBars
              items={analytics.distribution.byDistillery}
              emptyLabel="Henüz tadım notunuz yok."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
