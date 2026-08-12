import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../Button";
import { Field } from "../Field";
import { useAddComment, useComments, useDeleteComment, type Comment } from "../../data/comments";
import { t } from "../../i18n";
import { theme } from "../../theme";

/** Sunucu sınırı (comment.schema.ts) — istemci de aynı sınırı uyguluyor. */
const MAX_LENGTH = 1000;

interface NoteCommentsProps {
  noteId: string;
}

/**
 * Notun yorumları: liste, yazma ve silme.
 *
 * Web'deki NoteInteractions'ın yorum bölümünün karşılığı, ama açılır-kapanır
 * değil. Telefonda not ekranı zaten tek bir kaydırma; gizlemek yer kazandırmaz,
 * yalnızca bir dokunuş daha ekler.
 */
export function NoteComments({ noteId }: NoteCommentsProps) {
  const { data, isLoading, isError, error } = useComments(noteId);
  const addComment = useAddComment(noteId);

  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const comments = data ?? [];
  const trimmed = draft.trim();

  async function handleSend() {
    setSendError(null);
    try {
      await addComment.mutateAsync(trimmed);
      setDraft("");
    } catch (e) {
      setSendError(e instanceof Error ? e.message : t("comments.sendFailed"));
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>
        {comments.length > 0 ? t("comments.count", { count: comments.length }) : t("comments.title")}
      </Text>

      <View style={styles.body}>
        {isLoading && <ActivityIndicator color={theme.primary} />}

        {isError && (
          <Text style={styles.error}>
            {error instanceof Error ? error.message : t("error.unexpected")}
          </Text>
        )}

        {!isLoading && !isError && comments.length === 0 && (
          <Text style={styles.empty}>{t("comments.empty")}</Text>
        )}

        {comments.map((comment) => (
          <CommentRow key={comment.id} comment={comment} noteId={noteId} />
        ))}

        <View style={styles.form}>
          <Field
            label={t("comments.label")}
            tone="card"
            multiline
            value={draft}
            onChangeText={(value) => setDraft(value.slice(0, MAX_LENGTH))}
            placeholder={t("comments.placeholder")}
          />
          {/* Kalan karakter yalnızca sona yaklaşınca: her zaman görünen bir
              sayaç, kısa yorum yazan herkese sınırı hatırlatırdı. */}
          {draft.length > MAX_LENGTH - 100 && (
            <Text style={styles.remaining}>
              {t("comments.remaining", { count: MAX_LENGTH - draft.length })}
            </Text>
          )}
          {sendError && <Text style={styles.error}>{sendError}</Text>}
          <Button
            label={t("comments.send")}
            onPress={handleSend}
            busy={addComment.isPending}
            disabled={trimmed.length === 0}
          />
        </View>
      </View>
    </View>
  );
}

function CommentRow({ comment, noteId }: { comment: Comment; noteId: string }) {
  const deleteComment = useDeleteComment(noteId);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    // İki adım: geri dönüşü olmayan işleme tek dokunuşluk yol bırakılmıyor —
    // not silmedeki kalıbın aynısı.
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setDeleteError(null);
    try {
      await deleteComment.mutateAsync(comment.id);
    } catch (e) {
      setConfirming(false);
      setDeleteError(e instanceof Error ? e.message : t("comments.deleteFailed"));
    }
  }

  return (
    <View style={styles.comment}>
      <View style={styles.commentHead}>
        <Text style={styles.author}>{comment.author.name}</Text>
        <Text style={styles.date}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
      </View>

      <Text style={styles.text}>{comment.body}</Text>

      {/* Yetkiyi sunucu veriyor; burada yalnızca düğmenin görünürlüğü. */}
      {comment.canDelete && (
        <Pressable onPress={handleDelete} accessibilityRole="button" style={styles.delete}>
          <Text style={styles.deleteText}>
            {confirming ? t("comments.deleteConfirm") : t("comments.delete")}
          </Text>
        </Pressable>
      )}

      {deleteError && <Text style={styles.error}>{deleteError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  title: { color: theme.text, fontSize: 16, fontWeight: "700" },
  body: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  empty: { color: theme.textMuted, fontSize: 13 },
  comment: { gap: 4 },
  commentHead: { alignItems: "baseline", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  author: { color: theme.primary, fontSize: 14, fontWeight: "600" },
  date: { color: theme.textMuted, fontSize: 12 },
  text: { color: theme.text, fontSize: 14, lineHeight: 20 },
  delete: { justifyContent: "center", minHeight: 44 },
  deleteText: { color: theme.danger, fontSize: 13, fontWeight: "600" },
  form: { borderTopColor: theme.border, borderTopWidth: 1, gap: 10, paddingTop: 14 },
  remaining: { color: theme.textMuted, fontSize: 12, textAlign: "right" },
  error: { color: theme.danger, fontSize: 13 },
});
