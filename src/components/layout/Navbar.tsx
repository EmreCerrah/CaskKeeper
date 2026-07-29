import Link from "next/link";
import { GlassWater } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";

/**
 * Üst gezinme çubuğu (server component — oturumu doğrudan okur).
 */
export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <GlassWater className="h-6 w-6 text-primary" aria-hidden />
          <span className="font-serif text-xl font-bold tracking-tight text-gold-gradient">
            CaskKeeper
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/viskiler">Viskiler</Link>
          </Button>
          {session && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/panel">Panelim</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/akis">Akış</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/tadimlarim">Tadımlarım</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/favoriler">Favorilerim</Link>
              </Button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <UserMenu name={session.name} userId={session.userId} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/giris">Giriş Yap</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/kayit">Kayıt Ol</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobil gezinme */}
      {session && (
        <nav className="flex items-center justify-around border-t border-border/60 py-1 md:hidden">
          <Button asChild variant="ghost" size="sm">
            <Link href="/viskiler">Viskiler</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/panel">Panelim</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/akis">Akış</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/tadimlarim">Tadımlarım</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/favoriler">Favoriler</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
