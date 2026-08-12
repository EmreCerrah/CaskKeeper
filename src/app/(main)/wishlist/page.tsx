import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { wishlistService } from "@/server/services/WishlistService";
import { Button } from "@/components/ui/button";
import { WhiskeyCard } from "@/components/whiskey/WhiskeyCard";
import { Pagination } from "@/components/shared/Pagination";
import { getTranslations } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("wishlist.title") };
}
export const dynamic = "force-dynamic";

interface WishlistPageProps {
  searchParams: { page?: string };
}

export default async function WishlistPage({ searchParams }: WishlistPageProps) {
  const session = await getSession();
  if (!session) redirect("/sign-in?return=/wishlist");

  await connectToDatabase();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const result = await wishlistService.getWishlist(session.userId, { page, limit: 12 });
  const t = getTranslations();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">{t("wishlist.title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {result.total > 0
            ? t("wishlist.count", { count: result.total })
            : t("wishlist.subtitle")}
        </p>
      </div>

      {result.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {result.data.map((item) => (
              <WhiskeyCard key={item.whiskey.id} whiskey={item.whiskey} />
            ))}
          </div>
          <Pagination page={result.page} totalPages={result.totalPages} basePath="/wishlist" />
        </>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <Bookmark className="mx-auto mb-3 h-10 w-10 text-primary/50" aria-hidden />
          <p className="font-medium">{t("wishlist.empty")}</p>
          <p className="mt-1 text-sm">
            {t("wishlist.emptyHint")}
          </p>
          <Button asChild className="mt-4">
            <Link href="/whiskeys">{t("compare.exploreCatalogue")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
