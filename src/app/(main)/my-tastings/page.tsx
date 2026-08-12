import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NotebookPen } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";
import { Button } from "@/components/ui/button";
import { TastingNoteCard } from "@/components/tasting/TastingNoteCard";
import { Pagination } from "@/components/shared/Pagination";
import { getTranslations } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("myTastings.title") };
}
export const dynamic = "force-dynamic";

interface MyTastingsPageProps {
  searchParams: { page?: string };
}

export default async function MyTastingsPage({ searchParams }: MyTastingsPageProps) {
  const session = await getSession();
  if (!session) redirect("/sign-in?return=/my-tastings");

  await connectToDatabase();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const result = await tastingNoteService.getNotesByUser(session.userId, undefined, {
    page,
    limit: 10,
  });

  const t = getTranslations();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold">{t("myTastings.title")}</h1>
          <p className="mt-1 text-muted-foreground">
            {result.total > 0
              ? t("myTastings.count", { count: result.total })
              : t("myTastings.subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href="/whiskeys">
            <NotebookPen className="h-4 w-4" aria-hidden />
            {t("myTastings.new")}
          </Link>
        </Button>
      </div>

      {result.data.length > 0 ? (
        <>
          <div className="space-y-4">
            {result.data.map((note) => (
              <TastingNoteCard key={note.id} note={note} />
            ))}
          </div>
          <Pagination page={result.page} totalPages={result.totalPages} basePath="/my-tastings" />
        </>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <p className="font-medium">{t("myTastings.empty")}</p>
          <p className="mt-1 text-sm">
            <Link href="/whiskeys" className="text-primary hover:underline">
              {t("myTastings.emptyHintBefore")}
            </Link>{" "}
            {t("myTastings.emptyHintAfter")}
          </p>
        </div>
      )}
    </div>
  );
}
