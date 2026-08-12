import Link from "next/link";
import { GlassWater } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { getTranslations } from "@/lib/i18n/server";

/**
 * Üst gezinme çubuğu (server component — oturumu doğrudan okur).
 */
export async function Navbar() {
  const session = await getSession();
  const t = getTranslations();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2 md:min-h-0">
          <GlassWater className="h-6 w-6 text-primary" aria-hidden />
          <span className="font-serif text-xl font-bold tracking-tight text-gold-gradient">
            CaskKeeper
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/whiskeys">{t("nav.whiskies")}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/users">{t("nav.people")}</Link>
          </Button>
          {session && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">{t("nav.dashboard")}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/feed">{t("nav.feed")}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/my-tastings">{t("nav.myTastings")}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/favourites">{t("nav.favorites")}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/wishlist">{t("nav.wishlist")}</Link>
              </Button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Oturumsuz kullanıcı da görmeli: giriş/kayıt sayfalarını anlamayan
              biri zaten içeri giremez. */}
          <LocaleSwitcher />
          {session ? (
            <>
              <NotificationBell userId={session.userId} />
              {/* Mobilde gizli: profil, ayarlar, yönetim ve çıkış zaten alt
                  çubuktaki "Daha fazla" panelinde. Burada tutmak hem tekrar
                  olurdu hem de dar ekranlarda üst çubuğu taşırıyordu. */}
              <div className="hidden md:block">
                <UserMenu
                  name={session.name}
                  userId={session.userId}
                  isAdmin={session.role === "admin"}
                />
              </div>
            </>
          ) : (
            <>
              {/* Mobilde "Giriş" alt çubukta bir sekme; üstte yalnızca kayıt kalır */}
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link href="/sign-in">{t("nav.login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">{t("nav.register")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>

    </header>
  );
}
