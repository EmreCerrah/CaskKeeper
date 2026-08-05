"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

/**
 * Şema bir fonksiyon: doğrulama metinleri de çevrilmeli, ama t() bir hook
 * olduğu için modül seviyesinde çağrılamaz. Şema bileşen içinde, seçili dile
 * göre kurulur.
 */
const buildLoginSchema = (t: Translator) =>
  z.object({
    email: z.string().email(t("auth.validation.email")),
    password: z.string().min(1, t("auth.validation.passwordRequired")),
  });

type LoginFormValues = z.infer<ReturnType<typeof buildLoginSchema>>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = useMemo(() => buildLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.message ?? t("auth.login.failed"));
      return;
    }

    const donus = searchParams.get("donus");
    router.push(donus && donus.startsWith("/") ? donus : "/panel");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.field.email")}</Label>
        <Input id="email" type="email" autoComplete="email" placeholder={t("auth.field.emailPlaceholder")} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive-foreground/90">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.field.password")}</Label>
        <PasswordInput id="password" autoComplete="current-password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive-foreground/90">{errors.password.message}</p>}
      </div>

      {serverError && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {t("auth.login.submit")}
      </Button>
    </form>
  );
}
