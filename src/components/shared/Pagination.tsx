"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/client";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  /** Sayfa numarası hariç korunacak query parametreleri */
  searchParams?: Record<string, string | undefined>;
}

/**
 * Link tabanlı sayfalama. Durumu yok ama çeviri hook'unu kullandığı için
 * istemci bileşeni; hem sunucu hem istemci ağacından çağrılabilmesi gerekiyor.
 */
export function Pagination({ page, totalPages, basePath, searchParams = {} }: PaginationProps) {
  const t = useTranslations();
  if (totalPages <= 1) return null;

  function hrefFor(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set("sayfa", String(target));
    else params.delete("sayfa");
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav className="flex items-center justify-center gap-4 pt-8" aria-label={t("common.pagination")}>
      {page > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefFor(page - 1)}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Önceki
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Önceki
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        Sayfa <span className="font-medium text-foreground">{page}</span> / {totalPages}
      </span>

      {page < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefFor(page + 1)}>
            Sonraki
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Sonraki
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </nav>
  );
}
