"use client";

import { useState } from "react";
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

/** Virgülle ayrılmış metni diziye çevirir (boşları eler). */
function toList(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const WhiskeyFormSchema = z.object({
  brand: z.string().min(2, "Marka en az 2 karakter olmalı"),
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalı"),
  distillery: z.string().min(2, "Damıtımevi zorunludur"),
  type: z.string().min(2, "Tip zorunludur"),
  region: z.string().min(2, "Bölge zorunludur"),
  country: z.string().min(2, "Ülke zorunludur"),
  subRegion: z.string().optional(),
  abv: z.coerce.number().min(0, "0-100 arası olmalı").max(100, "0-100 arası olmalı"),
  age: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
  caskType: z.string().optional(),
  bottlingYear: z.union([z.coerce.number().int().min(1700), z.literal("")]).optional(),
  vintage: z.union([z.coerce.number().int().min(1700), z.literal("")]).optional(),
  limitedEdition: z.boolean(),
  description: z.string().optional(),
  flavorProfile: z.string().optional(),
  awards: z.string().optional(),
  tags: z.string().optional(),
  imageUrl: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  officialUrl: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  externalId: z.string().optional(),
});

type WhiskeyFormValues = z.infer<typeof WhiskeyFormSchema>;

interface WhiskeyFormProps {
  /** Verilirse düzenleme modu */
  whiskey?: WhiskeyDTO;
}

export function WhiskeyForm({ whiskey }: WhiskeyFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WhiskeyFormValues>({
    resolver: zodResolver(WhiskeyFormSchema),
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
          <CardTitle className="font-serif">Kimlik</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="brand">Marka *</Label>
            <Input id="brand" {...register("brand")} />
            {errors.brand && <p className="text-xs text-destructive-foreground/90">{errors.brand.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Ürün Adı *</Label>
            <Input id="name" placeholder="16 Year Old" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive-foreground/90">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="distillery">Damıtımevi *</Label>
            <Input id="distillery" {...register("distillery")} />
            {errors.distillery && (
              <p className="text-xs text-destructive-foreground/90">{errors.distillery.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Bilinmiyorsa üreticiyi yazın — kimliğin parçasıdır, boş bırakılamaz.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="externalId">Dış Kimlik (externalId)</Label>
            <Input id="externalId" placeholder="talisker-10" {...register("externalId")} />
            <p className="text-xs text-muted-foreground">
              Kalıcı kimlik — sonradan isim düzeltirseniz kopya oluşmasını önler.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Sınıflandırma</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Tip *</Label>
            <Input id="type" placeholder="Single Malt" {...register("type")} />
            {errors.type && <p className="text-xs text-destructive-foreground/90">{errors.type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Bölge *</Label>
            <Input id="region" placeholder="Islay" {...register("region")} />
            {errors.region && <p className="text-xs text-destructive-foreground/90">{errors.region.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Ülke *</Label>
            <Input id="country" {...register("country")} />
            {errors.country && <p className="text-xs text-destructive-foreground/90">{errors.country.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subRegion">Alt Bölge</Label>
            <Input id="subRegion" {...register("subRegion")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Teknik</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="abv">Alkol Oranı (%) *</Label>
            <Input id="abv" type="number" step="0.1" {...register("abv")} />
            {errors.abv && <p className="text-xs text-destructive-foreground/90">{errors.abv.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Yaş (yıl)</Label>
            <Input id="age" type="number" {...register("age")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caskType">Fıçı Tipi</Label>
            <Input id="caskType" {...register("caskType")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bottlingYear">Şişeleme Yılı</Label>
            <Input id="bottlingYear" type="number" {...register("bottlingYear")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vintage">Rekolte</Label>
            <Input id="vintage" type="number" {...register("vintage")} />
          </div>
          <div className="flex items-center gap-2 pt-7">
            <input
              id="limitedEdition"
              type="checkbox"
              className="h-4 w-4 accent-primary"
              {...register("limitedEdition")}
            />
            <Label htmlFor="limitedEdition">Limitli Üretim</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">İçerik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flavorProfile">Aroma Profili</Label>
            <Input id="flavorProfile" placeholder="smoke, peat, vanilla" {...register("flavorProfile")} />
            <p className="text-xs text-muted-foreground">Virgülle ayırın.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Etiketler</Label>
            <Input id="tags" placeholder="peated, islay, classic" {...register("tags")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="awards">Ödüller</Label>
            <Input id="awards" placeholder="IWSC 2023 Gold" {...register("awards")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Görsel URL</Label>
            <Input id="imageUrl" placeholder="https://…" {...register("imageUrl")} />
            {errors.imageUrl && <p className="text-xs text-destructive-foreground/90">{errors.imageUrl.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="officialUrl">Resmî Sayfa URL</Label>
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
          Vazgeç
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {whiskey ? "Değişiklikleri Kaydet" : "Kataloğa Ekle"}
        </Button>
      </div>
    </form>
  );
}
