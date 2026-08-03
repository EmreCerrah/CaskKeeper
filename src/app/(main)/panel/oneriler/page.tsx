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

export const metadata: Metadata = { title: "Öneriler" };
export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/panel/oneriler");

  await connectToDatabase();
  const recommendations = await recommendationService.getRecommendations(session.userId);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <Link
          href="/panel"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Panelime dön
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-bold">Öneriler</h1>
        <p className="mt-1 text-muted-foreground">
          Tadım notlarınızdaki aroma tercihlerinize göre, henüz denemediğiniz viskiler.
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
          <p className="font-medium">Henüz size özel öneri oluşturamadık.</p>
          <p className="mt-1 text-sm">
            Tadım notlarınızda aroma etiketi seçtikçe damak profiliniz oluşur ve öneriler burada görünür.
          </p>
          <Button asChild className="mt-4">
            <Link href="/viskiler">Katalogu Keşfet</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
