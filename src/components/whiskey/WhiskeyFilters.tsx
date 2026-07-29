"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { WhiskeyFacets } from "@/server/repositories/WhiskeyRepository";

interface WhiskeyFiltersProps {
  facets: WhiskeyFacets;
}

/**
 * Katalog arama + filtre çubuğu.
 * Durum URL query parametrelerinde tutulur (paylaşılabilir linkler).
 */
export function WhiskeyFilters({ facets }: WhiskeyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("arama") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("sayfa"); // filtre değişince ilk sayfaya dön
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Arama kutusu: 400ms debounce
  useEffect(() => {
    const current = searchParams.get("arama") ?? "";
    if (search === current) return;
    debounceRef.current = setTimeout(() => updateParams({ arama: search || null }), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, searchParams, updateParams]);

  const hasFilters =
    !!searchParams.get("arama") || !!searchParams.get("tip") || !!searchParams.get("bolge") || !!searchParams.get("ulke");

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Marka, isim veya damıtımevi ara…"
          className="pl-9"
          aria-label="Viski ara"
        />
      </div>

      <Select
        value={searchParams.get("tip") ?? ""}
        onChange={(e) => updateParams({ tip: e.target.value || null })}
        className="md:w-44"
        aria-label="Tip filtresi"
      >
        <option value="">Tüm Tipler</option>
        {facets.types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>

      <Select
        value={searchParams.get("bolge") ?? ""}
        onChange={(e) => updateParams({ bolge: e.target.value || null })}
        className="md:w-44"
        aria-label="Bölge filtresi"
      >
        <option value="">Tüm Bölgeler</option>
        {facets.regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>

      <Select
        value={searchParams.get("ulke") ?? ""}
        onChange={(e) => updateParams({ ulke: e.target.value || null })}
        className="md:w-44"
        aria-label="Ülke filtresi"
      >
        <option value="">Tüm Ülkeler</option>
        {facets.countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            router.push(pathname);
          }}
        >
          <X className="h-4 w-4" aria-hidden />
          Temizle
        </Button>
      )}
    </div>
  );
}
