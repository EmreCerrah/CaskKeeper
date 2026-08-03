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

export const metadata: Metadata = { title: "İstek Listem" };
export const dynamic = "force-dynamic";

interface WishlistPageProps {
  searchParams: { sayfa?: string };
}

export default async function WishlistPage({ searchParams }: WishlistPageProps) {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/istek-listem");

  await connectToDatabase();

  const page = Math.max(1, Number(searchParams.sayfa) || 1);
  const result = await wishlistService.getWishlist(session.userId, { page, limit: 12 });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">İstek Listem</h1>
        <p className="mt-1 text-muted-foreground">
          {result.total > 0
            ? `Denemeyi düşündüğünüz ${result.total} viski.`
            : "Denemeyi düşündüğünüz viskileri burada toplayın."}
        </p>
      </div>

      {result.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {result.data.map((item) => (
              <WhiskeyCard key={item.whiskey.id} whiskey={item.whiskey} />
            ))}
          </div>
          <Pagination page={result.page} totalPages={result.totalPages} basePath="/istek-listem" />
        </>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <Bookmark className="mx-auto mb-3 h-10 w-10 text-primary/50" aria-hidden />
          <p className="font-medium">İstek listeniz henüz boş.</p>
          <p className="mt-1 text-sm">
            Katalogda denemek istediğiniz bir viski bulduğunuzda, detay sayfasından ekleyin.
          </p>
          <Button asChild className="mt-4">
            <Link href="/viskiler">Kataloğu Keşfet</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
