"use client";

import Link from "next/link";
import { CalendarDays, Wind, Wine, Hourglass } from "lucide-react";
import type { CommentDTO, TastingNoteDTO } from "@/lib/types/dto";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "@/components/shared/RatingBadge";
import { NoteActions } from "./NoteActions";
import { NoteInteractions } from "./NoteInteractions";
import { UserAvatar } from "@/components/social/UserAvatar";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import { formatDate } from "@/lib/utils/date";
import type { TranslationKey } from "@/lib/i18n/translate";

const FINISH_LABELS: Record<string, TranslationKey> = {
  short: "note.finishShort",
  medium: "note.finishMedium",
  long: "note.finishLong",
};

interface TastingNoteCardProps {
  note: TastingNoteDTO;
  /** Viski detay sayfasında viski başlığını tekrarlamamak için */
  hideWhiskey?: boolean;
  /** Sahip aksiyonlarını (favori/düzenle/sil) göster. Salt-okunur görünümlerde false. */
  showActions?: boolean;
  /** Akış gibi görünümlerde notu yazan kullanıcıyı göster */
  showAuthor?: boolean;
  /**
   * Etkileşim çubuğunu (beğeni/yorum) etkinleştirir. Yalnızca `note.interactions`
   * doldurulmuş herkese açık görünümlerde anlamlıdır.
   */
  viewerIsAuthenticated?: boolean;
  /** Not sayfasında yorumlar açık gelir */
  commentsOpen?: boolean;
  /** Sunucuda çekilmiş yorumlar (kalıcı bağlantı sayfası) */
  initialComments?: CommentDTO[];
}

/** Tadım notu kartı — kişisel listelerde, akışta ve herkese açık profillerde kullanılır. */
export function TastingNoteCard({
  note,
  hideWhiskey = false,
  showActions = true,
  showAuthor = false,
  viewerIsAuthenticated = false,
  commentsOpen = false,
  initialComments,
}: TastingNoteCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const formattedDate = formatDate(note.tastingDate, locale);

  return (
    <Card>
      <CardHeader className="space-y-3 pb-3">
        {showAuthor && note.author && (
          <Link
            href={`/users/${note.author.id}`}
            className="flex w-fit items-center gap-2 text-sm hover:text-primary"
          >
            <UserAvatar name={note.author.name} src={note.author.profilePicture} size="sm" />
            <span className="font-medium">{note.author.name}</span>
          </Link>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {!hideWhiskey && note.whiskey && (
              <Link
                href={`/whiskeys/${note.whiskey.slug}`}
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
                  {t("note.public")}
                </Badge>
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <RatingBadge rating={note.rating} />
            {showActions && <NoteActions noteId={note.id} isFavorite={note.isFavorite} />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {(note.noseTags.length > 0 || note.noseNotes) && (
          <div className="flex items-start gap-2 text-sm">
            <Wind className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden />
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("note.noseLabel")}</span>
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
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("note.palateLabel")}</span>
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
              {t("note.finishPrefix")} — {t(FINISH_LABELS[note.finishLength])}
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

        {note.interactions && (
          <NoteInteractions
            noteId={note.id}
            interactions={note.interactions}
            isAuthenticated={viewerIsAuthenticated}
            defaultOpen={commentsOpen}
            initialComments={initialComments}
          />
        )}
      </CardContent>
    </Card>
  );
}
