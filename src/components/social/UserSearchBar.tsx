"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/client";

/**
 * Kullanıcı arama kutusu. Durum URL'de tutulur (paylaşılabilir/geri tuşu uyumlu),
 * yazarken 400ms debounce uygulanır.
 */
export function UserSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const t = useTranslations();

  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const applySearch = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("search", next);
      else params.delete("search");

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (value === current) return;

    debounceRef.current = setTimeout(() => applySearch(value), 400);
    return () => clearTimeout(debounceRef.current);
  }, [value, searchParams, applySearch]);

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("people.searchPlaceholder")}
          className="pl-9"
          aria-label={t("people.searchLabel")}
        />
      </div>

      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setValue("");
            applySearch("");
          }}
          title={t("common.clearSearch")}
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}
