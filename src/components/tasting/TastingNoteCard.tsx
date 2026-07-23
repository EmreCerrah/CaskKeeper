import Link from "next/link";
import { CalendarDays, Wind, Wine, Hourglass } from "lucide-react";
import type { TastingNoteDTO } from "@/lib/types/dto";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "@/components/shared/RatingBadge";
import { NoteActions } from "./NoteActions";

const FINISH_LABELS: Record<string, string> = {
  short: "Kısa bitiş",
  medium: "Orta bitiş",
  long: "Uzun bitiş",
};

interface TastingNoteCardProps {
  note: TastingNoteDTO;
  /** Viski detay sayfasında viski başlığını tekrarlamamak için */
  hideWhiskey?: boolean;
}

/** Tadım notu kartı — listelerde ve viski detayında kullanılır. */
export function TastingNoteCard({ note, hideWhiskey = false }: TastingNoteCardProps) {
  const formattedDate = new Date(note.tastingDate).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div className="min-w-0 space-y-1">
          {!hideWhiskey && note.whiskey && (
            <Link
              href={`/viskiler/${note.whiskey.slug}`}
              className="block truncate font-serif text-lg font-semibold hover:text-primary"
            >
              {note.whiskey.brand} {note.whiskey.name}
            </Link>
          )}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {formattedDate}
            {note.visibility === "public" && (
              <Badge variant="outline" className="ml-1">
                Herkese açık
              </Badge>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <RatingBadge rating={note.rating} />
          <NoteActions noteId={note.id} isFavorite={note.isFavorite} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {(note.noseTags.length > 0 || note.noseNotes) && (
          <div className="flex items-start gap-2 text-sm">
            <Wind className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden />
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Burun</span>
              {note.noseTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.noseTags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
              {note.noseNotes && <p className="text-muted-foreground">{note.noseNotes}</p>}
            </div>
          </div>
        )}

        {(note.palateTags.length > 0 || note.palateNotes) && (
          <div className="flex items-start gap-2 text-sm">
            <Wine className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden />
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Damak</span>
              {note.palateTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.palateTags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
              {note.palateNotes && <p className="text-muted-foreground">{note.palateNotes}</p>}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-sm">
          <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden />
          <div className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Bitiş — {FINISH_LABELS[note.finishLength]}
            </span>
            {note.finishTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.finishTags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
            {note.finishNotes && <p className="text-muted-foreground">{note.finishNotes}</p>}
          </div>
        </div>

        {note.personalNotes && (
          <blockquote className="border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
            {note.personalNotes}
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
