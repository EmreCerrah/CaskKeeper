import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";
import { interactionService } from "@/server/services/InteractionService";
import { AppError } from "@/lib/errors";
import { TastingNoteCard } from "@/components/tasting/TastingNoteCard";

export const dynamic = "force-dynamic";

interface NotePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const session = await getSession();
  await connectToDatabase();
  try {
    const note = await tastingNoteService.getPublicNote(params.id, session?.userId);
    const label = note.whiskey ? `${note.whiskey.brand} ${note.whiskey.name}` : "Tadım notu";
    return { title: `${label} — ${note.author?.name ?? "Tadım"}` };
  } catch {
    return { title: "Tadım Notu Bulunamadı" };
  }
}

/**
 * Tek bir tadım notunun kalıcı bağlantısı.
 * Beğeni ve yorum bildirimleri buraya yönlendirir.
 */
export default async function TastingNotePage({ params }: NotePageProps) {
  const session = await getSession();
  await connectToDatabase();

  let note;
  try {
    note = await tastingNoteService.getPublicNote(params.id, session?.userId);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }

  // Yorumlar sunucuda çekilir: sayfanın asıl içeriği budur, HTML'de yer almalı
  const comments = await interactionService.getComments(params.id, session?.userId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      {note.author && (
        <Link
          href={`/kullanicilar/${note.author.id}`}
          className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {note.author.name} profiline dön
        </Link>
      )}

      <TastingNoteCard
        note={note}
        showActions={false}
        showAuthor
        viewerIsAuthenticated={Boolean(session)}
        commentsOpen
        initialComments={comments}
      />
    </div>
  );
}
