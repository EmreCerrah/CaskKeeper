"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { UserDTO } from "@/lib/types/dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/lib/i18n/client";
import type { Translator } from "@/lib/i18n/translate";

const buildProfileSchema = (t: Translator) =>
  z.object({
    name: z
      .string()
      .min(2, t("validation.nameMin"))
      .max(60, t("validation.nameMax")),
    bio: z.string().max(500, t("profileForm.bioMax")).optional(),
    profilePicture: z.string().url(t("profileForm.urlInvalid")).optional().or(z.literal("")),
  });

type ProfileFormValues = z.infer<ReturnType<typeof buildProfileSchema>>;

interface ProfileFormProps {
  user: UserDTO;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const schema = useMemo(() => buildProfileSchema(t), [t]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      bio: user.bio ?? "",
      profilePicture: user.profilePicture ?? "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    setSaved(false);

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.message ?? t("profileForm.failed"));
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("auth.field.name")}</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive-foreground/90">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.field.email")}</Label>
        <Input id="email" value={user.email} disabled aria-readonly />
        <p className="text-xs text-muted-foreground">{t("profileForm.emailFixed")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">{t("profileForm.bio")}</Label>
        <Textarea
          id="bio"
          rows={3}
          placeholder={t("profileForm.bioPlaceholder")}
          {...register("bio")}
        />
        {errors.bio && <p className="text-xs text-destructive-foreground/90">{errors.bio.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profilePicture">{t("profileForm.picture")}</Label>
        <Input id="profilePicture" placeholder="https://…" {...register("profilePicture")} />
        {errors.profilePicture && (
          <p className="text-xs text-destructive-foreground/90">{errors.profilePicture.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
          {serverError}
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {t("profileForm.saved")}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {t("profileForm.save")}
      </Button>
    </form>
  );
}
