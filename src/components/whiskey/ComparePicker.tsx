"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search, X } from "lucide-react";
import type { WhiskeyDTO } from "@/lib/types/dto";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buildCompareHref, MAX_COMPARE_ITEMS } from "@/lib/utils/comparison";

interface ComparePickerProps {
  /** Şu anda karşılaştırmada olan slug'lar — sonuçlardan çıkarılır */
  selectedSlugs: string[];
}

const RESULT_LIMIT = 6;

/**
 * Karşılaştırmaya viski ekleme kutusu. Katalog aramasını kullanır; seçim
 * yapıldığında slug URL'ye eklenir (durum URL'de tutulduğu için ayrı bir
 * istemci state'i ya da kalıcı kayıt gerekmez).
 */
export function ComparePicker({ selectedSlugs }: ComparePickerProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WhiskeyDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const isFull = selectedSlugs.length >= MAX_COMPARE_ITEMS;

  const runSearch = useCallback(
    async (term: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          search: term,
          limit: String(RESULT_LIMIT + selectedSlugs.length),
        });
        const res = await fetch(`/api/whiskeys?${params.toString()}`);
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message ?? "Arama başarısız");

        const found = (payload.data?.data ?? []) as WhiskeyDTO[];
        // Zaten karşılaştırmada olanları listeden çıkar
        setResults(found.filter((w) => !selectedSlugs.includes(w.slug)).slice(0, RESULT_LIMIT));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Arama başarısız");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedSlugs]
  );

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => void runSearch(term), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, runSearch]);

  function addWhiskey(slug: string) {
    setQuery("");
    setResults([]);
    router.push(buildCompareHref([...selectedSlugs, slug]));
  }

  if (isFull) {
    return (
      <p className="text-sm text-muted-foreground">
        En fazla {MAX_COMPARE_ITEMS} viski karşılaştırılabilir. Yenisini eklemek için
        birini çıkarın.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Karşılaştırmaya viski ekle — marka, isim veya damıtımevi ara…"
            className="pl-9"
            aria-label="Karşılaştırmaya eklenecek viskiyi ara"
          />
        </div>
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            title="Aramayı temizle"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Aranıyor…
        </p>
      )}

      {error && <p className="text-sm text-destructive-foreground">{error}</p>}

      {!loading && query.trim().length >= 2 && results.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Eşleşen viski bulunamadı.</p>
      )}

      {results.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-md border">
          {results.map((whiskey) => (
            <li key={whiskey.id}>
              <button
                type="button"
                onClick={() => addWhiskey(whiskey.slug)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent/50"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{whiskey.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {whiskey.brand} · {whiskey.type} · {whiskey.region}
                  </span>
                </span>
                <Plus className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
