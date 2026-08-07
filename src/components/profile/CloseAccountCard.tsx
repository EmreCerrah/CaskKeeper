"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutClient } from "@/lib/auth/logout-client";
import { useTranslations } from "@/lib/i18n/client";

/**
 * Hesabı kalıcı olarak kapatma kartı.
 *
 * İki aşamalı: önce yalnızca bir düğme görünür, uyarı ve parola alanı ancak
 * kullanıcı niyetini belirtince açılır. Geri dönüşü olmayan bir işlem için tek
 * tıklık bir yol bırakılmıyor.
 */
export function CloseAccountCard() {
  const router = useRouter();
  const t = useTranslations();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClose() {
    setBusy(true);
    setError(null);

    const res = await fetch("/api/users/me/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      setError(json.message ?? t("profile.closeFailed"));
      setBusy(false);
      return;
    }

    // Oturum çerezi sunucuda zaten düşürüldü; buradaki çağrı cihazdaki
    // çevrimdışı kopyayı silmek ve anahtarı sıfırlamak için — aynı temizlik
    // çıkışta da yapılıyor, tek yerde toplu tutuluyor.
    await logoutClient();

    router.push("/");
    router.refresh();
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-destructive-foreground">
          <AlertTriangle className="h-5 w-5" aria-hidden />
          {t("profile.closeTitle")}
        </CardTitle>
        <CardDescription>{t("profile.closeDescription")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!confirming ? (
          <Button variant="outline" onClick={() => setConfirming(true)}>
            {t("profile.closeStart")}
          </Button>
        ) : (
          <>
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {t("profile.closeWarning")}
            </p>

            <div className="space-y-2">
              <Label htmlFor="close-password">{t("profile.closePasswordLabel")}</Label>
              <PasswordInput
                id="close-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <p className="text-xs text-muted-foreground">{t("profile.closePasswordHint")}</p>
            </div>

            {error && <p className="text-sm text-destructive-foreground/90">{error}</p>}

            <div className="flex flex-wrap gap-2">
              <Button variant="destructive" onClick={handleClose} disabled={busy || password.length === 0}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                {t("profile.closeConfirm")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setConfirming(false);
                  setPassword("");
                  setError(null);
                }}
                disabled={busy}
              >
                {t("profile.closeCancel")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
