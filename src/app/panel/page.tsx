import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GlassWater, Heart, NotebookPen, Star } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TastingNoteCard } from "@/components/tasting/TastingNoteCard";

export const metadata: Metadata = { title: "Panelim" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/panel");

  await connectToDatabase();
  const stats = await tastingNoteService.getDashboardStats(session.userId);

  const statCards = [
    { icon: NotebookPen, label: "Toplam Tadım", value: String(stats.totalNotes) },
    { icon: GlassWater, label: "Farklı Viski", value: String(stats.distinctWhiskeys) },
    {
      icon: Star,
      label: "Ortalama Puan",
      value: stats.averageRating != null ? String(stats.averageRating) : "—",
    },
    { icon: Heart, label: "Favori Tadım", value: String(stats.favoriteCount) },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold">
            Hoş geldiniz, <span className="text-gold-gradient">{session.name}</span>
          </h1>
          <p className="mt-1 text-muted-foreground">İşte tadım yolculuğunuzun özeti.</p>
        </div>
        <Button asChild>
          <Link href="/viskiler">
            <NotebookPen className="h-4 w-4" aria-hidden />
            Yeni Tadım Başlat
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
        {/* Son tadımlar */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold">Son Tadımlarınız</h2>
          {stats.recentNotes.length > 0 ? (
            stats.recentNotes.map((note) => <TastingNoteCard key={note.id} note={note} />)
          ) : (
            <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              <p className="font-medium">Henüz tadım notunuz yok.</p>
              <p className="mt-1 text-sm">
                <Link href="/viskiler" className="text-primary hover:underline">
                  Katalogdan bir viski seçerek
                </Link>{" "}
                ilk notunuzu yazın.
              </p>
            </div>
          )}
        </div>

        {/* Damak profili */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold">Damak Profiliniz</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En Çok Seçtiğiniz Aromalar
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
                  Tadım notlarınızda aroma etiketi seçtikçe damak profiliniz burada şekillenecek.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
