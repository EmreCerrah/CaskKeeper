import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("auth.login.submit") };
}

export default function LoginPage() {
  const t = getTranslations();

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">{t("auth.login.heading")}</CardTitle>
          <CardDescription>{t("auth.login.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.login.noAccount")}{" "}
            <Link href="/kayit" className="text-primary hover:underline">
              {t("auth.login.registerLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
