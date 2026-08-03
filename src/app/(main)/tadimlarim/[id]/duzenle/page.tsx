import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";
import { whiskeyService } from "@/server/services/WhiskeyService";
import { AppError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { TastingNoteForm } from "@/components/tasting/TastingNoteForm";

export const metadata: Metadata = { title: "Tadım Notunu Düzenle" };
export const dynamic = "force-dynamic";

interface EditTastingPageProps {
  params: { id: string };
}

export default async function EditTastingPage({ params }: EditTastingPageProps) {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/tadimlarim");

  await connectToDatabase();

  let note;
  try {
    note = await tastingNoteService.getNoteForUser(params.id, session.userId);
  } catch (error) {
    if (error instanceof AppError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  const whiskey = note.whiskey ?? (await whiskeyService.getWhiskeyById(note.whiskeyId));

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/tadimlarim">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Tadımlarıma Dön
        </Link>
      </Button>

      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Tadım Notunu Düzenle
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold">
          {whiskey.brand} <span className="text-gold-gradient">{whiskey.name}</span>
        </h1>
      </div>

      <TastingNoteForm whiskey={whiskey} note={note} />
    </div>
  );
}
