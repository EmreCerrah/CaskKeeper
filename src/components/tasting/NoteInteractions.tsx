"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
import type { CommentDTO, NoteInteractionsDTO } from "@/lib/types/dto";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/social/UserAvatar";
import { formatRelativeTime } from "@/lib/utils/date";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/cn";

const MAX_COMMENT_LENGTH = 1000;

interface NoteInteractionsProps {
  noteId: string;
  interactions: NoteInteractionsDTO;
  /** Oturum açık değilse beğeni/yorum yerine giriş bağlantısı gösterilir */
  isAuthenticated: boolean;
  /** Not sayfasında yorumlar doğrudan açık gelir */
  defaultOpen?: boolean;
  /**
   * Sunucuda çekilmiş yorumlar. Verildiğinde yorumlar HTML'e gömülür ve
   * açılışta ayrıca istek atılmaz — kalıcı bağlantı sayfası bunu kullanır.
   */
  initialComments?: CommentDTO[];
}

/**
 * Tadım notu kartının altındaki etkileşim çubuğu: beğeni, yorum sayısı ve
 * açılır yorum bölümü. Yorumlar, sunucudan gelmediyse bölüm açıldığında çekilir.
 */
export function NoteInteractions({
  noteId,
  interactions,
  isAuthenticated,
  defaultOpen = false,
  initialComments,
}: NoteInteractionsProps) {
  const router = useRouter();

  const [liked, setLiked] = useState(interactions.isLikedByViewer);
  const [likeCount, setLikeCount] = useState(interactions.likeCount);
  const [commentCount, setCommentCount] = useState(interactions.commentCount);
  const [likeBusy, setLikeBusy] = useState(false);

  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const [comments, setComments] = useState<CommentDTO[] | null>(initialComments ?? null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasting-notes/${noteId}/comments`);
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message ?? "Yorumlar getirilemedi");
      setComments(payload.data as CommentDTO[]);
      setCommentCount((payload.data as CommentDTO[]).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yorumlar getirilemedi");
    } finally {
      setLoadingComments(false);
    }
  }, [noteId]);

  // Bölüm ilk kez açıldığında yorumları çek
  useEffect(() => {
    if (open && comments === null && !loadingComments) {
      void loadComments();
    }
  }, [open, comments, loadingComments, loadComments]);

  async function toggleLike() {
    if (!isAuthenticated || likeBusy) return;

    setLikeBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasting-notes/${noteId}/like`, {
        method: liked ? "DELETE" : "POST",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message ?? t("interactions.likeFailed"));

      const next = payload.data as NoteInteractionsDTO;
      setLiked(next.isLikedByViewer);
      setLikeCount(next.likeCount);
      setCommentCount(next.commentCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("interactions.likeFailed"));
    } finally {
      setLikeBusy(false);
    }
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasting-notes/${noteId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message ?? "Yorum eklenemedi");

      const created = payload.data as CommentDTO;
      setComments((prev) => [...(prev ?? []), created]);
      setCommentCount((c) => c + 1);
      setDraft("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yorum eklenemedi");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(commentId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message ?? "Yorum silinemedi");
      }
      setComments((prev) => (prev ?? []).filter((c) => c.id !== commentId));
      setCommentCount((c) => Math.max(0, c - 1));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yorum silinemedi");
    }
  }

  return (
    <div className="border-t border-border/60 pt-3">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLike}
          disabled={!isAuthenticated || likeBusy}
          aria-pressed={liked}
          title={
            isAuthenticated
              ? liked
                ? t("interactions.unlike")
                : t("interactions.like")
              : t("interactions.likeSignIn")
          }
        >
          {likeBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Heart
              className={cn("h-4 w-4", liked ? "fill-primary text-primary" : "text-muted-foreground")}
              aria-hidden
            />
          )}
          <span className="tabular-nums">{likeCount}</span>
          <span className="sr-only">{t("interactions.likeUnit")}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          title={open ? t("interactions.hideComments") : t("interactions.showComments")}
        >
          <MessageCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="tabular-nums">{commentCount}</span>
          <span className="sr-only">yorum</span>
        </Button>

        <Link
          href={`/tadimlar/${noteId}`}
          className="ml-auto text-xs text-muted-foreground hover:text-primary"
        >
          {t("interactions.openNote")}
        </Link>
      </div>

      {error && <p className="pt-2 text-sm text-destructive-foreground">{error}</p>}

      {open && (
        <div className="space-y-3 pt-3">
          {loadingComments && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t("interactions.loadingComments")}
            </p>
          )}

          {comments?.length === 0 && !loadingComments && (
            <p className="text-sm text-muted-foreground">
              {t("interactions.noComments")}
            </p>
          )}

          {comments?.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <Link href={`/kullanicilar/${comment.author.id}`} className="shrink-0">
                <UserAvatar
                  name={comment.author.name}
                  src={comment.author.profilePicture}
                  size="sm"
                />
              </Link>
              <div className="min-w-0 flex-1 rounded-md bg-secondary/40 px-3 py-2">
                <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
                  <Link
                    href={`/kullanicilar/${comment.author.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {comment.author.name}
                  </Link>
                  <span className="text-muted-foreground">
                    {formatRelativeTime(comment.createdAt, locale, t)}
                  </span>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.body}</p>
              </div>
              {comment.canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteComment(comment.id)}
                  title="Yorumu sil"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Button>
              )}
            </div>
          ))}

          {isAuthenticated ? (
            <form onSubmit={submitComment} className="space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("interactions.commentPlaceholder")}
                maxLength={MAX_COMMENT_LENGTH}
                className="min-h-[64px]"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {draft.length} / {MAX_COMMENT_LENGTH}
                </span>
                <Button type="submit" size="sm" disabled={submitting || draft.trim().length === 0}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden />
                  )}
                  {t("interactions.send")}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("interactions.signInToCommentBefore")}{" "}
              <Link href="/giris" className="text-primary hover:underline">
                {t("interactions.signInToCommentLink")}
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
