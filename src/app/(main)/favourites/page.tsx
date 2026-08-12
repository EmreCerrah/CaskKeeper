import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";
import { TastingNoteCard } from "@/components/tasting/TastingNoteCard";
import { Pagination } from "@/components/shared/Pagination";
import { getTranslations } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("favorites.title") };
}
export const dynamic = "force-dynamic";

interface FavoritesPageProps {
  searchParams: { page?: string };
}

export default async function FavoritesPage({ searchParams }: FavoritesPageProps) {
  const session = await getSession();
  if (!session) redirect("/sign-in?return=/favourites");

  await connectToDatabase();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const result = await tastingNoteService.getNotesByUser(
    session.userId,
    { onlyFavorites: true },
    { page, limit: 10 }
  );

  const t = getTranslations();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">{t("favorites.title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {result.total > 0
            ? t("favorites.count", { count: result.total })
            : t("favorites.subtitle")}
        </p>
      </div>

      {result.data.length > 0 ? (
        <>
          <div className="space-y-4">
            {result.data.map((note) => (
              <TastingNoteCard key={note.id} note={note} />
            ))}
          </div>
          <Pagination page={result.page} totalPages={result.totalPages} basePath="/favourites" />
        </>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <p className="font-medium">{t("favorites.empty")}</p>
          <p className="mt-1 text-sm">
            <Link href="/my-tastings" className="text-primary hover:underline">
              {t("favorites.emptyHintBefore")}
            </Link>{" "}
            {t("favorites.emptyHintAfter")}
          </p>
        </div>
      )}
    </div>
  );
}
