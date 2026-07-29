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

export const metadata: Metadata = { title: "Tadımlarım" };
export const dynamic = "force-dynamic";

interface MyTastingsPageProps {
  searchParams: { sayfa?: string };
}

export default async function MyTastingsPage({ searchParams }: MyTastingsPageProps) {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/tadimlarim");

  await connectToDatabase();

  const page = Math.max(1, Number(searchParams.sayfa) || 1);
  const result = await tastingNoteService.getNotesByUser(session.userId, undefined, {
    page,
    limit: 10,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold">Tadımlarım</h1>
          <p className="mt-1 text-muted-foreground">
            {result.total > 0
              ? `Toplam ${result.total} tadım seansı kaydettiniz.`
              : "Henüz tadım notunuz yok."}
          </p>
        </div>
        <Button asChild>
          <Link href="/viskiler">
            <NotebookPen className="h-4 w-4" aria-hidden />
            Yeni Tadım
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
          <Pagination page={result.page} totalPages={result.totalPages} basePath="/tadimlarim" />
        </>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <p className="font-medium">Günlüğünüz sizi bekliyor.</p>
          <p className="mt-1 text-sm">
            <Link href="/viskiler" className="text-primary hover:underline">
              Katalogdan bir viski seçin
            </Link>{" "}
            ve ilk tadım notunuzu yazın.
          </p>
        </div>
      )}
    </div>
  );
}
