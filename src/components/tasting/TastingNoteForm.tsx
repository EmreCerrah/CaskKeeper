"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Heart, Loader2 } from "lucide-react";
import type { TastingNoteDTO, WhiskeyDTO } from "@/lib/types/dto";
import { FINISH_LENGTHS } from "@/lib/constants/aroma-wheel";
import { notifyOfflineDataChanged } from "@/lib/offline/sync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlavorTagPicker } from "./FlavorTagPicker";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "@/lib/i18n/client";
import type { Translator } from "@/lib/i18n/translate";

// İstemci form şeması — API şemasıyla aynı kurallar, tarih string olarak alınır
const buildTastingSchema = (t: Translator) =>
  z.object({
    tastingDate: z.string().min(1, t("validation.tastingDateRequired")),
    rating: z.coerce.number().min(0, t("validation.ratingRange")).max(100, t("validation.ratingRange")),
    noseTags: z.array(z.string()),
    noseNotes: z.string().max(1000, t("validation.noseNotesMax")).optional(),
    palateTags: z.array(z.string()),
    palateNotes: z.string().max(1000, t("validation.palateNotesMax")).optional(),
    finishTags: z.array(z.string()),
    finishNotes: z.string().max(1000, t("validation.finishNotesMax")).optional(),
    finishLength: z.enum(["short", "medium", "long"], {
      errorMap: () => ({ message: t("validation.finishLengthRequired") }),
    }),
    personalNotes: z.string().max(2000, t("validation.personalNotesMax")).optional(),
    visibility: z.enum(["private", "public"]),
    isFavorite: z.boolean(),
  });

type TastingFormValues = z.infer<ReturnType<typeof buildTastingSchema>>;

interface TastingNoteFormProps {
  whiskey: WhiskeyDTO;
  /** Verilirse düzenleme modu */
  note?: TastingNoteDTO;
}

export function TastingNoteForm({ whiskey, note }: TastingNoteFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const schema = useMemo(() => buildTastingSchema(t), [t]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TastingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: note
      ? {
          tastingDate: note.tastingDate.slice(0, 10),
          rating: note.rating,
          noseTags: note.noseTags,
          noseNotes: note.noseNotes ?? "",
          palateTags: note.palateTags,
          palateNotes: note.palateNotes ?? "",
          finishTags: note.finishTags,
          finishNotes: note.finishNotes ?? "",
          finishLength: note.finishLength,
          personalNotes: note.personalNotes ?? "",
          visibility: note.visibility,
          isFavorite: note.isFavorite,
        }
      : {
          tastingDate: new Date().toISOString().slice(0, 10),
          rating: 75,
          noseTags: [],
          noseNotes: "",
          palateTags: [],
          palateNotes: "",
          finishTags: [],
          finishNotes: "",
          finishLength: "medium",
          personalNotes: "",
          visibility: "private",
          isFavorite: false,
        },
  });

  const rating = watch("rating");

  async function onSubmit(values: TastingFormValues) {
    setServerError(null);

    const payload = { ...values, ...(note ? {} : { whiskey: whiskey.id }) };
    const url = note ? `/api/tasting-notes/${note.id}` : "/api/tasting-notes";
    const method = note ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.message ?? t("noteForm.failed"));
      return;
    }

    notifyOfflineDataChanged();
    router.push("/tadimlarim");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tarih + Puan */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("noteForm.sessionCard")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tastingDate">{t("noteForm.date")}</Label>
              <Input id="tastingDate" type="date" {...register("tastingDate")} />
              {errors.tastingDate && (
                <p className="text-xs text-destructive-foreground/90">{errors.tastingDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">
                {t("noteForm.rating")} <span className="font-bold text-primary">{rating}</span>
                <span className="text-muted-foreground"> / 100</span>
              </Label>
              <input
                id="rating"
                type="range"
                min={0}
                max={100}
                step={1}
                className="rating-slider"
                {...register("rating")}
              />
              {errors.rating && (
                <p className="text-xs text-destructive-foreground/90">{errors.rating.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Burun */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("noteForm.noseCard")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            control={control}
            name="noseTags"
            render={({ field }) => (
              <FlavorTagPicker label={t("noteForm.nose")} value={field.value} onChange={field.onChange} />
            )}
          />
          <div className="space-y-2">
            <Label htmlFor="noseNotes">{t("noteForm.noseNotes")}</Label>
            <Textarea
              id="noseNotes"
              placeholder={t("noteForm.nosePlaceholder")}
              {...register("noseNotes")}
            />
            {errors.noseNotes && (
              <p className="text-xs text-destructive-foreground/90">{errors.noseNotes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Damak */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("noteForm.palateCard")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            control={control}
            name="palateTags"
            render={({ field }) => (
              <FlavorTagPicker label={t("noteForm.palate")} value={field.value} onChange={field.onChange} />
            )}
          />
          <div className="space-y-2">
            <Label htmlFor="palateNotes">{t("noteForm.palateNotes")}</Label>
            <Textarea
              id="palateNotes"
              placeholder={t("noteForm.palatePlaceholder")}
              {...register("palateNotes")}
            />
            {errors.palateNotes && (
              <p className="text-xs text-destructive-foreground/90">{errors.palateNotes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bitiş */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("noteForm.finishCard")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            control={control}
            name="finishTags"
            render={({ field }) => (
              <FlavorTagPicker label={t("noteForm.finish")} value={field.value} onChange={field.onChange} />
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="finishLength">{t("noteForm.finishLength")}</Label>
              <Select id="finishLength" {...register("finishLength")}>
                {FINISH_LENGTHS.map((f) => (
                  <option key={f.id} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
              {errors.finishLength && (
                <p className="text-xs text-destructive-foreground/90">{errors.finishLength.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="finishNotes">{t("noteForm.finishNotes")}</Label>
            <Textarea
              id="finishNotes"
              placeholder={t("noteForm.finishPlaceholder")}
              {...register("finishNotes")}
            />
            {errors.finishNotes && (
              <p className="text-xs text-destructive-foreground/90">{errors.finishNotes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kişisel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("noteForm.personalCard")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personalNotes">{t("noteForm.personalNotes")}</Label>
            <Textarea
              id="personalNotes"
              rows={4}
              placeholder={t("noteForm.personalPlaceholder")}
              {...register("personalNotes")}
            />
            {errors.personalNotes && (
              <p className="text-xs text-destructive-foreground/90">{errors.personalNotes.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="visibility">{t("noteForm.visibility")}</Label>
              <Select id="visibility" {...register("visibility")}>
                <option value="private">{t("noteForm.visibilityPrivate")}</option>
                <option value="public">{t("noteForm.visibilityPublic")}</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("noteForm.favorite")}</Label>
              <Controller
                control={control}
                name="isFavorite"
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "flex h-11 w-full items-center justify-center gap-2 rounded-md border text-sm transition-colors md:h-10",
                      field.value
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-input bg-secondary/50 text-muted-foreground hover:text-foreground"
                    )}
                    aria-pressed={field.value}
                  >
                    <Heart className={cn("h-4 w-4", field.value && "fill-current")} aria-hidden />
                    {field.value ? "Favorilerimde" : "Favorilere ekle"}
                  </button>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {serverError && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
          {t("noteForm.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {note ? t("noteForm.saveChanges") : t("noteForm.save")}
        </Button>
      </div>
    </form>
  );
}
