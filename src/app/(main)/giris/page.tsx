import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Giriş Yap" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Tekrar Hoş Geldiniz</CardTitle>
          <CardDescription>Tadım günlüğünüze devam etmek için giriş yapın.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link href="/kayit" className="text-primary hover:underline">
              Kayıt olun
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
