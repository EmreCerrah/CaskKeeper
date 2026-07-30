"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AROMA_TAG_CATEGORIES } from "@/lib/constants/aroma-wheel";
import { cn } from "@/lib/utils/cn";

interface FlavorTagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Erişilebilirlik için alan adı ("Burun", "Damak", "Bitiş") */
  label: string;
}

/**
 * Aroma çarkından etiket seçici — kategoriler açılıp kapanır,
 * seçili etiketler amber vurgu ile gösterilir.
 */
export function FlavorTagPicker({ value, onChange, label }: FlavorTagPickerProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  function toggleTag(tag: string) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  }

  return (
    <div className="space-y-2" role="group" aria-label={`${label} aroma etiketleri`}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="inline-flex min-h-11 items-center rounded-full border border-primary/40 bg-primary/15 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/25"
              title="Kaldırmak için tıklayın"
            >
              {tag} ✕
            </button>
          ))}
        </div>
      )}

      <div className="divide-y divide-border rounded-md border">
        {AROMA_TAG_CATEGORIES.map((category) => {
          const isOpen = openCategory === category.category;
          const selectedInCategory = category.tags.filter((t) => value.includes(t)).length;

          return (
            <div key={category.category}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-accent/50"
                onClick={() => setOpenCategory(isOpen ? null : category.category)}
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-2">
                  {category.label}
                  {selectedInCategory > 0 && (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                      {selectedInCategory}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                  aria-hidden
                />
              </button>

              {isOpen && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                  {category.tags.map((tag) => {
                    const selected = value.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          // min-h-11 (44px): mobilde parmakla güvenli seçim için
                          // WCAG 2.5.5 dokunma hedefi eşiği
                          "inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-xs transition-colors",
                          selected
                            ? "border-primary/50 bg-primary/20 text-primary"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        )}
                        aria-pressed={selected}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
