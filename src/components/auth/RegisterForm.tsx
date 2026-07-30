"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

const RegisterFormSchema = z
  .object({
    name: z.string().min(2, "İsim en az 2 karakter olmalı").max(60, "İsim en fazla 60 karakter olabilir"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    password: z.string().min(8, "Parola en az 8 karakter olmalı").max(72, "Parola en fazla 72 karakter olabilir"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Parolalar eşleşmiyor",
    path: ["passwordConfirm"],
  });

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
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
      setServerError(json.message ?? "Kayıt oluşturulamadı");
      return;
    }

    router.push("/panel");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">İsim</Label>
        <Input id="name" autoComplete="name" placeholder="Adınız Soyadınız" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive-foreground/90">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="ornek@eposta.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive-foreground/90">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Parola</Label>
        <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive-foreground/90">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordConfirm">Parola (Tekrar)</Label>
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
        Hesap Oluştur
      </Button>
    </form>
  );
}
