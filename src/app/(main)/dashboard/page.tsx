import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, GlassWater, Heart, NotebookPen, Sparkles, Star } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TastingNoteCard } from "@/components/tasting/TastingNoteCard";
import { getTranslations } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("dashboard.title") };
}
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in?return=/dashboard");

  await connectToDatabase();
  const stats = await tastingNoteService.getDashboardStats(session.userId);
  const t = getTranslations();

  const statCards = [
    { icon: NotebookPen, label: t("dashboard.statTotal"), value: String(stats.totalNotes) },
    { icon: GlassWater, label: t("dashboard.statDistinct"), value: String(stats.distinctWhiskeys) },
    {
      icon: Star,
      label: t("dashboard.statAverage"),
      value: stats.averageRating != null ? String(stats.averageRating) : "—",
    },
    { icon: Heart, label: t("dashboard.statFavorites"), value: String(stats.favoriteCount) },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold">
            {t("dashboard.welcome")} <span className="text-gold-gradient">{session.name}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/whiskeys">
            <NotebookPen className="h-4 w-4" aria-hidden />
            {t("dashboard.startTasting")}
          </Link>
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-card/60">
            <CardContent className="flex items-center gap-4 pt-6">
              <stat.icon className="h-8 w-8 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Son tadımlar
            min-w-0: grid öğelerinin varsayılan `min-width: auto` değeri, içindeki
            `truncate` (whitespace-nowrap) viski adının max-content genişliğinin
            altına inmelerini engelliyordu; dar ekranda sütun 695px'e şişip sayfayı
            yatay kaydırılabilir hale getiriyordu. */}
        <div className="min-w-0 space-y-4">
          <h2 className="font-serif text-xl font-semibold">{t("dashboard.recentTastings")}</h2>
          {stats.recentNotes.length > 0 ? (
            stats.recentNotes.map((note) => <TastingNoteCard key={note.id} note={note} />)
          ) : (
            <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              <p className="font-medium">{t("dashboard.noNotes")}</p>
              <p className="mt-1 text-sm">
                <Link href="/whiskeys" className="text-primary hover:underline">
                  {t("dashboard.noNotesHintBefore")}
                </Link>{" "}
                {t("dashboard.noNotesHintAfter")}
              </p>
            </div>
          )}
        </div>

        {/* Damak profili */}
        <div className="min-w-0 space-y-4">
          <h2 className="font-serif text-xl font-semibold">{t("dashboard.palateProfile")}</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.topFlavors")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topFlavorTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stats.topFlavorTags.map((item) => (
                    <Badge key={item.tag} variant="gold">
                      {item.tag} · {item.count}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.noFlavors")}
                </p>
              )}
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/statistics">
              <BarChart3 className="h-4 w-4" aria-hidden />
              {t("dashboard.detailedStats")}
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/recommendations">
              <Sparkles className="h-4 w-4" aria-hidden />
              {t("dashboard.recommendations")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
