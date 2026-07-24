import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";
import { Button } from "@/components/ui/button";
import { TastingNoteCard } from "@/components/tasting/TastingNoteCard";
import { Pagination } from "@/components/shared/Pagination";

export const metadata: Metadata = { title: "Akış" };
export const dynamic = "force-dynamic";

interface FeedPageProps {
  searchParams: { sayfa?: string };
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/akis");

  await connectToDatabase();

  const page = Math.max(1, Number(searchParams.sayfa) || 1);
  const feed = await tastingNoteService.getFeed(session.userId, { page, limit: 10 });

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Akış</h1>
        <p className="mt-1 text-muted-foreground">
          Takip ettiğiniz kişilerin en yeni herkese açık tadımları.
        </p>
      </div>

      {feed.data.length > 0 ? (
        <>
          <div className="space-y-4">
            {feed.data.map((note) => (
              <TastingNoteCard key={note.id} note={note} showActions={false} showAuthor />
            ))}
          </div>
          <Pagination page={feed.page} totalPages={feed.totalPages} basePath="/akis" />
        </>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <Compass className="mx-auto mb-3 h-10 w-10 text-primary/50" aria-hidden />
          <p className="font-medium">Akışınız henüz boş.</p>
          <p className="mt-1 text-sm">
            Diğer tutkunları takip ederek onların herkese açık tadımlarını burada görün.
          </p>
          <Button asChild className="mt-4">
            <Link href="/viskiler">Kataloğu Keşfet</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
