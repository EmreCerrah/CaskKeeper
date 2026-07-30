"use client";

import { useMemo, useState } from "react";
import { Table2, X } from "lucide-react";
import type { FlavorTrendPointDTO } from "@/lib/types/dto";
import { CATEGORY_CHART_COLORS } from "@/lib/constants/aroma-wheel";
import { Button } from "@/components/ui/button";

interface FlavorTrendChartProps {
  trend: FlavorTrendPointDTO[];
}

function formatPeriod(period: string): string {
  return new Date(`${period}-01`).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

/**
 * Aylık aroma kategorisi dağılımı — her ay bir yığılmış (stacked) yatay bar.
 * Segment değerleri hover/klavye odağında tooltip ile gösterilir; aynı veri
 * "Tablo görünümü" ile hover'a bağımlı olmadan da erişilebilir.
 */
export function FlavorTrendChart({ trend }: FlavorTrendChartProps) {
  const [showTable, setShowTable] = useState(false);

  // Grafikte görünen tüm kategoriler, ilk görüldükleri ayın sırasına göre
  // (lejant tutarlı kalsın diye ayrıca alfabetik değil, veri sırasına göre)
  const legend = useMemo(() => {
    const seen = new Map<string, string>();
    for (const point of trend) {
      for (const cat of point.categories) {
        if (!seen.has(cat.category)) seen.set(cat.category, cat.label);
      }
    }
    return Array.from(seen.entries()).map(([category, label]) => ({ category, label }));
  }, [trend]);

  if (trend.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Tadım notlarınızda aroma etiketi seçtikçe zaman içindeki değişim burada görünecek.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lejant — 2+ kategori olduğu için her zaman gösterilir */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {legend.map((item) => (
          <span key={item.category} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: CATEGORY_CHART_COLORS[item.category] ?? "#898781" }}
              aria-hidden
            />
            {item.label}
          </span>
        ))}
      </div>

      {/* Aylık yığılmış barlar */}
      <div className="space-y-3">
        {trend.map((point) => (
          <div key={point.period} className="space-y-1">
            <div className="flex items-baseline justify-between text-xs text-muted-foreground">
              <span className="capitalize">{formatPeriod(point.period)}</span>
              <span className="tabular-nums">{point.total} etiket</span>
            </div>
            <div className="flex h-5 w-full gap-0.5 overflow-hidden rounded" role="img" aria-label={`${formatPeriod(point.period)}: ${point.total} aroma etiketi`}>
              {point.categories.map((cat, idx) => {
                const widthPct = (cat.count / point.total) * 100;
                const isFirst = idx === 0;
                const isLast = idx === point.categories.length - 1;
                return (
                  <div
                    key={cat.category}
                    tabIndex={0}
                    className="group/segment relative h-full outline-none"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: CATEGORY_CHART_COLORS[cat.category] ?? "#898781",
                      borderTopLeftRadius: isFirst ? 4 : 0,
                      borderBottomLeftRadius: isFirst ? 4 : 0,
                      borderTopRightRadius: isLast ? 4 : 0,
                      borderBottomRightRadius: isLast ? 4 : 0,
                    }}
                  >
                    {/* max-w + normal sarma: uzun kategori adları dar ekranda
                        görünüm alanını taşırıyordu (ör. "Diğer/Feinty (Leather/Meaty)") */}
                    <div
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 max-w-[60vw] -translate-x-1/2 whitespace-normal break-words rounded-md border border-border bg-popover px-2 py-1 text-center text-xs opacity-0 shadow-md transition-opacity group-hover/segment:opacity-100 group-focus/segment:opacity-100 sm:max-w-none sm:whitespace-nowrap"
                    >
                      <span className="font-medium text-foreground">{cat.count}</span>{" "}
                      <span className="text-muted-foreground">{cat.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={() => setShowTable((v) => !v)}>
        {showTable ? <X className="h-4 w-4" aria-hidden /> : <Table2 className="h-4 w-4" aria-hidden />}
        {showTable ? "Tabloyu gizle" : "Tablo görünümü"}
      </Button>

      {showTable && <FlavorTrendTable trend={trend} legend={legend} />}
    </div>
  );
}

function FlavorTrendTable({
  trend,
  legend,
}: {
  trend: FlavorTrendPointDTO[];
  legend: { category: string; label: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-left text-xs">
        <thead className="bg-secondary/40 text-muted-foreground">
          <tr>
            <th className="whitespace-nowrap px-3 py-2 font-medium">Ay</th>
            {legend.map((item) => (
              <th key={item.category} className="whitespace-nowrap px-3 py-2 font-medium">
                {item.label}
              </th>
            ))}
            <th className="whitespace-nowrap px-3 py-2 font-medium">Toplam</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {trend.map((point) => {
            const counts = new Map(point.categories.map((c) => [c.category, c.count]));
            return (
              <tr key={point.period}>
                <td className="whitespace-nowrap px-3 py-2 capitalize text-foreground">
                  {formatPeriod(point.period)}
                </td>
                {legend.map((item) => (
                  <td key={item.category} className="px-3 py-2 tabular-nums text-muted-foreground">
                    {counts.get(item.category) ?? "–"}
                  </td>
                ))}
                <td className="px-3 py-2 font-medium tabular-nums text-foreground">{point.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
