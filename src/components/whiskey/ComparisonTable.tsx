import Link from "next/link";
import { X } from "lucide-react";
import type { WhiskeyDTO } from "@/lib/types/dto";
import { Badge } from "@/components/ui/badge";
import { WhiskeyImage } from "./WhiskeyImage";
import { buildCompareHref, findSharedFlavors } from "@/lib/utils/comparison";

interface ComparisonTableProps {
  whiskeys: WhiskeyDTO[];
}

/** Değeri olmayan hücrelerde gösterilen işaret. */
const EMPTY = "—";

/** Karşılaştırma satırları — her satır bir özellik, her sütun bir viski. */
const SPEC_ROWS: { label: string; value: (w: WhiskeyDTO) => string }[] = [
  { label: "Marka", value: (w) => w.brand },
  { label: "Tip", value: (w) => w.type },
  { label: "Damıtımevi", value: (w) => w.distillery },
  {
    label: "Bölge",
    value: (w) => (w.subRegion ? `${w.region} (${w.subRegion})` : w.region),
  },
  { label: "Ülke", value: (w) => w.country },
  { label: "Alkol Oranı", value: (w) => `%${w.abv}` },
  { label: "Yaş", value: (w) => (w.age != null ? `${w.age} Yıl` : EMPTY) },
  { label: "Fıçı Tipi", value: (w) => w.caskType ?? EMPTY },
  {
    label: "Şişeleme Yılı",
    value: (w) => (w.bottlingYear != null ? String(w.bottlingYear) : EMPTY),
  },
  { label: "Rekolte", value: (w) => (w.vintage != null ? String(w.vintage) : EMPTY) },
  { label: "Limitli Üretim", value: (w) => (w.limitedEdition ? "Evet" : "Hayır") },
];

/**
 * Viskileri yan yana karşılaştıran tablo.
 *
 * Ortak aroma notaları altın rozetle vurgulanır — karşılaştırmanın asıl
 * değeri burada, "hangi notalar örtüşüyor" sorusunda. Rozet metni ayrıca
 * "ortak" ibaresi taşır, yani ayrım yalnızca renge dayanmaz.
 */
export function ComparisonTable({ whiskeys }: ComparisonTableProps) {
  const slugs = whiskeys.map((w) => w.slug);
  const sharedFlavors = findSharedFlavors(whiskeys.map((w) => w.flavorProfile));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">
          Seçili viskilerin teknik özellik ve aroma profili karşılaştırması
        </caption>

        <thead>
          <tr>
            <th scope="col" className="w-36 p-3 text-left align-bottom">
              <span className="sr-only">Özellik</span>
            </th>
            {whiskeys.map((whiskey) => (
              <th key={whiskey.id} scope="col" className="p-3 align-bottom">
                <div className="space-y-2">
                  <WhiskeyImage
                    src={whiskey.imageUrl}
                    alt={`${whiskey.brand} ${whiskey.name}`}
                    className="h-32 w-full rounded-md border"
                  />
                  <Link
                    href={`/viskiler/${whiskey.slug}`}
                    className="block font-serif text-base font-semibold leading-snug hover:text-primary"
                  >
                    {whiskey.name}
                  </Link>
                  <Link
                    href={buildCompareHref(slugs.filter((s) => s !== whiskey.slug))}
                    className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" aria-hidden />
                    Çıkar
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {SPEC_ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="p-3 text-left font-medium text-muted-foreground">
                {row.label}
              </th>
              {whiskeys.map((whiskey) => (
                <td key={whiskey.id} className="p-3 align-top">
                  {row.value(whiskey)}
                </td>
              ))}
            </tr>
          ))}

          <tr>
            <th scope="row" className="p-3 text-left font-medium text-muted-foreground">
              Aroma Profili
            </th>
            {whiskeys.map((whiskey) => (
              <td key={whiskey.id} className="p-3 align-top">
                {whiskey.flavorProfile.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {whiskey.flavorProfile.map((flavor) => {
                      const isShared = sharedFlavors.has(flavor);
                      return (
                        <Badge
                          key={flavor}
                          variant={isShared ? "gold" : "secondary"}
                          title={isShared ? "Tüm karşılaştırılan viskilerde ortak" : undefined}
                        >
                          {flavor}
                          {isShared && <span className="ml-1 opacity-80">· ortak</span>}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  EMPTY
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
