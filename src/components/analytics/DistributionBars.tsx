import type { DistributionItemDTO } from "@/lib/types/dto";

interface DistributionBarsProps {
  items: DistributionItemDTO[];
  emptyLabel: string;
}

/**
 * Tek serili yatay bar listesi (tip/bölge/damıtımevi dağılımı gibi).
 * Tek renk kullanıldığı için (kategorik kimlik değil, tek büyüklük ölçüsü)
 * lejant gerekmez; her değer satırda doğrudan görünür olduğundan hover'a
 * bağımlı bir gizli veri yoktur.
 */
export function DistributionBars({ items, emptyLabel }: DistributionBarsProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((i) => i.count));

  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const pct = max > 0 ? Math.round((item.count / max) * 100) : 0;
        return (
          <li key={item.label} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate text-foreground">{item.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{item.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/60">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
