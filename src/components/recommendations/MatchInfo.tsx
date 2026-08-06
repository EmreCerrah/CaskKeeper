"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/lib/i18n/client";

interface MatchInfoProps {
  score: number;
  matchedCategories: { category: string; label: string }[];
}

/** Öneri kartının altında gösterilen eşleşme yüzdesi ve kategori rozetleri. */
export function MatchInfo({ score, matchedCategories }: MatchInfoProps) {
  const t = useTranslations();
  const percent = Math.round(score * 100);

  return (
    <div className="space-y-1.5 border-t border-border/60 pt-2">
      <p className="text-xs font-medium text-primary">{t("match.percent", { percent })}</p>
      {matchedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {matchedCategories.map((cat) => (
            <Badge key={cat.category} variant="outline" className="text-[10px]">
              {cat.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
