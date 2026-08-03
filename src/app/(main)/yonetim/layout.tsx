import Link from "next/link";
import { redirect } from "next/navigation";
import { GlassWater, ShieldCheck, Users } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import connectToDatabase from "@/lib/db";
import { Button } from "@/components/ui/button";

/**
 * Yönetim alanı düzeni. Yetki kontrolü burada tek noktada yapılır —
 * alt sayfaların tamamı yönetici gerektirir.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/yonetim");

  // Rol token yerine veritabanından doğrulanır — yetkisi kaldırılan kullanıcı
  // eski token'ıyla yönetim alanına giremez.
  await connectToDatabase();
  if (!(await isCurrentUserAdmin(session.userId))) redirect("/panel");

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
          <h1 className="font-serif text-2xl font-bold">Yönetim</h1>
        </div>
        <nav className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/yonetim/viskiler">
              <GlassWater className="h-4 w-4" aria-hidden />
              Katalog
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/yonetim/kullanicilar">
              <Users className="h-4 w-4" aria-hidden />
              Kullanıcılar
            </Link>
          </Button>
        </nav>
      </div>

      {children}
    </div>
  );
}
