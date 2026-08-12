"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/lib/i18n/client";
import type { Translator } from "@/lib/i18n/translate";

/** Doğrulama metinleri de çevrilir; bkz. LoginForm'daki aynı desen. */
const buildRegisterSchema = (t: Translator) =>
  z
    .object({
      name: z
        .string()
        .min(2, t("validation.nameMin"))
        .max(60, t("validation.nameMax")),
      email: z.string().email(t("validation.email")),
      password: z
        .string()
        .min(8, t("validation.passwordMin"))
        .max(72, t("validation.passwordMax")),
      passwordConfirm: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t("validation.passwordMismatch"),
      path: ["passwordConfirm"],
    });

type RegisterFormValues = z.infer<ReturnType<typeof buildRegisterSchema>>;

export function RegisterForm() {
  const router = useRouter();
  const t = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = useMemo(() => buildRegisterSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", passwordConfirm: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.message ?? t("auth.register.failed"));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("auth.field.name")}</Label>
        <Input id="name" autoComplete="name" placeholder={t("auth.field.namePlaceholder")} {...register("name")} />
        {errors.name && <p className="text-xs text-destructive-foreground/90">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.field.email")}</Label>
        <Input id="email" type="email" autoComplete="email" placeholder={t("auth.field.emailPlaceholder")} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive-foreground/90">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.field.password")}</Label>
        <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive-foreground/90">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordConfirm">{t("auth.field.passwordConfirm")}</Label>
        <PasswordInput id="passwordConfirm" autoComplete="new-password" {...register("passwordConfirm")} />
        {errors.passwordConfirm && (
          <p className="text-xs text-destructive-foreground/90">{errors.passwordConfirm.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {t("auth.register.submit")}
      </Button>
    </form>
  );
}
