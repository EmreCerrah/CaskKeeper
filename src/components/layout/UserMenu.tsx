"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUserRound, LogOut, User, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  name: string;
  userId: string;
}

/** Sağ üst kullanıcı menüsü — profil linki ve çıkış. */
export function UserMenu({ name, userId }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <CircleUserRound className="h-4 w-4 text-primary" aria-hidden />
        <span className="max-w-[120px] truncate">{name}</span>
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border bg-popover shadow-lg"
        >
          <Link
            href={`/kullanicilar/${userId}`}
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            <UserCircle className="h-4 w-4" aria-hidden />
            Herkese Açık Profilim
          </Link>
          <Link
            href="/profil"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4" aria-hidden />
            Profil Ayarları
          </Link>
          <button
            role="menuitem"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-destructive-foreground/90 hover:bg-accent"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}
