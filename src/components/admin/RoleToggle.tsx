"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleToggleProps {
  userId: string;
  role: "user" | "admin";
  /** Kendi satırında yetki kaldırma engellenir */
  isSelf: boolean;
}

/** Kullanıcıya yönetici yetkisi verir veya kaldırır. */
export function RoleToggle({ userId, role, isSelf }: RoleToggleProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = role === "admin";

  async function toggle() {
    setBusy(true);
    setError(null);

    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: isAdmin ? "user" : "admin" }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.message ?? "Rol değiştirilemedi");
      setBusy(false);
      return;
    }

    setBusy(false);
    router.refresh();
  }

  if (isSelf && isAdmin) {
    return <span className="text-xs text-muted-foreground">Kendi hesabınız</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant={isAdmin ? "outline" : "secondary"} size="sm" onClick={toggle} disabled={busy}>
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : isAdmin ? (
          <ShieldOff className="h-4 w-4" aria-hidden />
        ) : (
          <ShieldCheck className="h-4 w-4" aria-hidden />
        )}
        {isAdmin ? "Yetkiyi Kaldır" : "Yönetici Yap"}
      </Button>
      {error && <span className="text-xs text-destructive-foreground/90">{error}</span>}
    </div>
  );
}
