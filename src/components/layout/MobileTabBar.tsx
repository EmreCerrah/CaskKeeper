"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BarChart3,
  Bookmark,
  Compass,
  GlassWater,
  Heart,
  LogIn,
  LogOut,
  MoreHorizontal,
  NotebookPen,
  ShieldCheck,
  User,
  UserCircle,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { OfflineToggle } from "@/components/offline/OfflineToggle";
import { logoutClient } from "@/lib/auth/logout-client";
import { useTranslations } from "@/lib/i18n/client";
import type { TranslationKey } from "@/lib/i18n/translate";

interface MobileTabBarProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** Oturum açmış kullanıcının herkese açık profil bağlantısı için */
  userId?: string;
  /** Çevrimdışı kopyanın kime ait olduğunu kaydetmek için */
  userName?: string;
  /** "Daha fazla" sekmesindeki bildirim satırında gösterilir */
  unreadCount: number;
}

interface TabItem {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
}

/** Oturum açmış kullanıcı için birincil hedefler (4 sekme + "Daha fazla"). */
const AUTHED_TABS: TabItem[] = [
  { href: "/viskiler", labelKey: "nav.whiskies", icon: GlassWater },
  { href: "/tadimlarim", labelKey: "nav.myTastings", icon: NotebookPen },
  { href: "/akis", labelKey: "nav.feed", icon: Compass },
  { href: "/istek-listem", labelKey: "nav.wishlistShort", icon: Bookmark },
];

/** Oturumsuz kullanıcı için: herkese açık sayfalar erişilebilir kalmalı. */
const GUEST_TABS: TabItem[] = [
  { href: "/viskiler", labelKey: "nav.whiskies", icon: GlassWater },
  { href: "/kullanicilar", labelKey: "nav.people", icon: Users },
  { href: "/karsilastir", labelKey: "nav.compare", icon: BarChart3 },
  { href: "/giris", labelKey: "nav.loginShort", icon: LogIn },
];

/**
 * Mobil alt sekme çubuğu — yalnızca `md` altında görünür.
 *
 * Masaüstü gezinme çubuğu mobilde gizli olduğundan, oradaki her hedef ya bu
 * çubukta ya da "Daha fazla" sayfasında karşılığını bulmalı; aksi halde sayfa
 * mobilde yalnızca URL yazarak erişilebilir hale gelir.
 */
export function MobileTabBar({
  isAuthenticated,
  isAdmin,
  userId,
  userName,
  unreadCount,
}: MobileTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const [moreOpen, setMoreOpen] = useState(false);

  // Gezinme sonrası panel açık kalmasın
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // Panel açıkken arka planın kaymasını engelle
  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const tabs = isAuthenticated ? AUTHED_TABS : GUEST_TABS;

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await logoutClient();
    setMoreOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {moreOpen && (
        <MoreSheet
          isAdmin={isAdmin}
          userId={userId}
          userName={userName}
          unreadCount={unreadCount}
          onClose={() => setMoreOpen(false)}
          onLogout={handleLogout}
        />
      )}

      <nav
        aria-label={t("a11y.mobileNav")}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="flex items-stretch">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px]",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <tab.icon
                    className={cn("h-5 w-5", active && "fill-primary/15")}
                    aria-hidden
                  />
                  <span className="truncate">{t(tab.labelKey)}</span>
                </Link>
              </li>
            );
          })}

          {isAuthenticated && (
            <li className="flex-1">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className={cn(
                  "flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px]",
                  moreOpen ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span className="relative">
                  <MoreHorizontal className="h-5 w-5" aria-hidden />
                  {unreadCount > 0 && !moreOpen && (
                    <span
                      className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full bg-primary"
                      aria-hidden
                    />
                  )}
                </span>
                <span className="truncate">{t("nav.more")}</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}

interface MoreSheetProps {
  isAdmin: boolean;
  userId?: string;
  userName?: string;
  unreadCount: number;
  onClose: () => void;
  onLogout: () => void;
}

/** Alt çubuğa sığmayan hedefler — masaüstündeki her bağlantının karşılığı burada. */
function MoreSheet({ isAdmin, userId, userName, unreadCount, onClose, onLogout }: MoreSheetProps) {
  const t = useTranslations();

  const items: { href: string; labelKey: TranslationKey; icon: LucideIcon; badge?: number }[] = [
    { href: "/panel", labelKey: "nav.dashboard", icon: BarChart3 },
    { href: "/bildirimler", labelKey: "nav.notifications", icon: Bell, badge: unreadCount },
    { href: "/favoriler", labelKey: "nav.favorites", icon: Heart },
    { href: "/kullanicilar", labelKey: "nav.people", icon: Users },
    { href: "/karsilastir", labelKey: "nav.compareLong", icon: BarChart3 },
    ...(userId
      ? [{ href: `/kullanicilar/${userId}`, labelKey: "nav.publicProfile" as TranslationKey, icon: UserCircle }]
      : []),
    { href: "/profil", labelKey: "nav.profileSettings", icon: User },
    ...(isAdmin ? [{ href: "/yonetim", labelKey: "nav.admin" as TranslationKey, icon: ShieldCheck }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label={t("a11y.closeMenu")}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      <div
        role="menu"
        aria-label={t("a11y.otherPages")}
        className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card pb-[calc(env(safe-area-inset-bottom)+72px)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <span className="font-serif text-lg font-semibold">{t("nav.menu")}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("a11y.close")}
            className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <ul className="divide-y divide-border/60">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                role="menuitem"
                onClick={onClose}
                className="flex min-h-[52px] items-center gap-3 px-4 py-3 text-sm hover:bg-accent/50"
              >
                <item.icon className="h-5 w-5 shrink-0 text-primary/80" aria-hidden />
                <span className="flex-1">{t(item.labelKey)}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold tabular-nums text-primary-foreground">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}

          {userId && userName && (
            <li>
              <OfflineToggle userId={userId} userName={userName} variant="menu" />
            </li>
          )}

          <li>
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left text-sm text-destructive-foreground/90 hover:bg-accent/50"
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden />
              {t("nav.logout")}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
