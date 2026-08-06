"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { WhiskeyDTO } from "@/lib/types/dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n/client";
import type { Translator } from "@/lib/i18n/translate";

/** Virgülle ayrılmış metni diziye çevirir (boşları eler). */
function toList(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const buildWhiskeySchema = (t: Translator) =>
  z.object({
    brand: z.string().min(2, t("whiskeyForm.brandMin")),
    name: z.string().min(2, t("whiskeyForm.nameMin")),
    distillery: z.string().min(2, t("whiskeyForm.distilleryRequired")),
    type: z.string().min(2, t("whiskeyForm.typeRequired")),
    region: z.string().min(2, t("whiskeyForm.regionRequired")),
    country: z.string().min(2, t("whiskeyForm.countryRequired")),
    subRegion: z.string().optional(),
    abv: z.coerce.number().min(0, t("whiskeyForm.abvRange")).max(100, t("whiskeyForm.abvRange")),
    age: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
    caskType: z.string().optional(),
    bottlingYear: z.union([z.coerce.number().int().min(1700), z.literal("")]).optional(),
    vintage: z.union([z.coerce.number().int().min(1700), z.literal("")]).optional(),
    limitedEdition: z.boolean(),
    description: z.string().optional(),
    flavorProfile: z.string().optional(),
    awards: z.string().optional(),
    tags: z.string().optional(),
    imageUrl: z.string().url(t("profileForm.urlInvalid")).optional().or(z.literal("")),
    officialUrl: z.string().url(t("profileForm.urlInvalid")).optional().or(z.literal("")),
    externalId: z.string().optional(),
  });

type WhiskeyFormValues = z.infer<ReturnType<typeof buildWhiskeySchema>>;

interface WhiskeyFormProps {
  /** Verilirse düzenleme modu */
  whiskey?: WhiskeyDTO;
}

export function WhiskeyForm({ whiskey }: WhiskeyFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const schema = useMemo(() => buildWhiskeySchema(t), [t]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WhiskeyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: whiskey
      ? {
          brand: whiskey.brand,
          name: whiskey.name,
          distillery: whiskey.distillery ?? "",
          type: whiskey.type,
          region: whiskey.region,
          country: whiskey.country,
          subRegion: whiskey.subRegion ?? "",
          abv: whiskey.abv,
          age: whiskey.age ?? "",
          caskType: whiskey.caskType ?? "",
          bottlingYear: whiskey.bottlingYear ?? "",
          vintage: whiskey.vintage ?? "",
          limitedEdition: whiskey.limitedEdition,
          description: whiskey.description ?? "",
          flavorProfile: whiskey.flavorProfile.join(", "),
          awards: whiskey.awards.join(", "),
          tags: whiskey.tags.join(", "),
          imageUrl: whiskey.imageUrl ?? "",
          officialUrl: whiskey.officialUrl ?? "",
          externalId: "",
        }
      : {
          brand: "",
          name: "",
          distillery: "",
          type: "",
          region: "",
          country: "Scotland",
          subRegion: "",
          abv: 40,
          age: "",
          caskType: "",
          bottlingYear: "",
          vintage: "",
          limitedEdition: false,
          description: "",
          flavorProfile: "",
          awards: "",
          tags: "",
          imageUrl: "",
          officialUrl: "",
          externalId: "",
        },
  });

  async function onSubmit(values: WhiskeyFormValues) {
    setServerError(null);

    // Boş opsiyonel alanları göndermeyerek şemadaki .optional() ile uyumlu kal
    const payload: Record<string, unknown> = {
      brand: values.brand,
      name: values.name,
      distillery: values.distillery,
      type: values.type,
      region: values.region,
      country: values.country,
      abv: values.abv,
      limitedEdition: values.limitedEdition,
      flavorProfile: toList(values.flavorProfile),
      awards: toList(values.awards),
      tags: toList(values.tags),
    };

    const optionalText = { subRegion: values.subRegion, caskType: values.caskType, description: values.description, imageUrl: values.imageUrl, officialUrl: values.officialUrl, externalId: values.externalId };
    for (const [key, val] of Object.entries(optionalText)) {
      if (val) payload[key] = val;
    }
    for (const key of ["age", "bottlingYear", "vintage"] as const) {
      const val = values[key];
      if (val !== "" && val !== undefined) payload[key] = val;
    }

    const url = whiskey ? `/api/whiskeys/${whiskey.slug}` : "/api/whiskeys";
    const method = whiskey ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.message ?? "Viski kaydedilemedi");
      return;
    }

    router.push("/yonetim/viskiler");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("whiskeyForm.identityCard")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand">{t("whiskeyForm.brand")}</Label>
            <Input id="brand" {...register("brand")} />
            {errors.brand && <p className="text-xs text-destructive-foreground/90">{errors.brand.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t("whiskeyForm.name")}</Label>
            <Input id="name" placeholder="16 Year Old" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive-foreground/90">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="distillery">{t("whiskeyForm.distillery")}</Label>
            <Input id="distillery" {...register("distillery")} />
            {errors.distillery && (
              <p className="text-xs text-destructive-foreground/90">{errors.distillery.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("whiskeyForm.distilleryHint")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="externalId">{t("whiskeyForm.externalId")}</Label>
            <Input id="externalId" placeholder="talisker-10" {...register("externalId")} />
            <p className="text-xs text-muted-foreground">
              {t("whiskeyForm.externalIdHint")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("whiskeyForm.classificationCard")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">{t("whiskeyForm.type")}</Label>
            <Input id="type" placeholder="Single Malt" {...register("type")} />
            {errors.type && <p className="text-xs text-destructive-foreground/90">{errors.type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">{t("whiskeyForm.region")}</Label>
            <Input id="region" placeholder="Islay" {...register("region")} />
            {errors.region && <p className="text-xs text-destructive-foreground/90">{errors.region.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">{t("whiskeyForm.country")}</Label>
            <Input id="country" {...register("country")} />
            {errors.country && <p className="text-xs text-destructive-foreground/90">{errors.country.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subRegion">{t("whiskeyForm.subRegion")}</Label>
            <Input id="subRegion" {...register("subRegion")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("whiskeyForm.technicalCard")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="abv">{t("whiskeyForm.abv")}</Label>
            <Input id="abv" type="number" step="0.1" {...register("abv")} />
            {errors.abv && <p className="text-xs text-destructive-foreground/90">{errors.abv.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">{t("whiskeyForm.age")}</Label>
            <Input id="age" type="number" {...register("age")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caskType">{t("whiskeyForm.caskType")}</Label>
            <Input id="caskType" {...register("caskType")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bottlingYear">{t("whiskeyForm.bottlingYear")}</Label>
            <Input id="bottlingYear" type="number" {...register("bottlingYear")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vintage">{t("whiskeyForm.vintage")}</Label>
            <Input id="vintage" type="number" {...register("vintage")} />
          </div>
          <div className="flex items-center gap-2 pt-7">
            <input
              id="limitedEdition"
              type="checkbox"
              className="h-4 w-4 accent-primary"
              {...register("limitedEdition")}
            />
            <Label htmlFor="limitedEdition">{t("whiskeyForm.limitedEdition")}</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("whiskeyForm.contentCard")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">{t("whiskeyForm.description")}</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flavorProfile">{t("whiskeyForm.flavorProfile")}</Label>
            <Input id="flavorProfile" placeholder="smoke, peat, vanilla" {...register("flavorProfile")} />
            <p className="text-xs text-muted-foreground">{t("whiskeyForm.commaHint")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">{t("whiskeyForm.tags")}</Label>
            <Input id="tags" placeholder="peated, islay, classic" {...register("tags")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="awards">{t("whiskeyForm.awards")}</Label>
            <Input id="awards" placeholder="IWSC 2023 Gold" {...register("awards")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">{t("whiskeyForm.imageUrl")}</Label>
            <Input id="imageUrl" placeholder="https://…" {...register("imageUrl")} />
            {errors.imageUrl && <p className="text-xs text-destructive-foreground/90">{errors.imageUrl.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="officialUrl">{t("whiskeyForm.officialUrl")}</Label>
            <Input id="officialUrl" placeholder="https://…" {...register("officialUrl")} />
            {errors.officialUrl && <p className="text-xs text-destructive-foreground/90">{errors.officialUrl.message}</p>}
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
          {t("whiskeyForm.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {whiskey ? t("whiskeyForm.saveChanges") : t("whiskeyForm.create")}
        </Button>
      </div>
    </form>
  );
}
