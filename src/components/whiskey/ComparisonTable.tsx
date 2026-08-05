import Link from "next/link";
import { X } from "lucide-react";
import type { WhiskeyDTO } from "@/lib/types/dto";
import { Badge } from "@/components/ui/badge";
import { WhiskeyImage } from "./WhiskeyImage";
import { buildCompareHref, findSharedFlavors } from "@/lib/utils/comparison";
import { getTranslations } from "@/lib/i18n/server";
import type { Translator } from "@/lib/i18n/translate";

interface ComparisonTableProps {
  whiskeys: WhiskeyDTO[];
}

/** Değeri olmayan hücrelerde gösterilen işaret. */
const EMPTY = "—";

/**
 * Karşılaştırma satırları — her satır bir özellik, her sütun bir viski.
 * Etiketler çevrildiği için sabit dizi yerine t()'yi alan bir fonksiyon.
 */
const buildSpecRows = (t: Translator): { label: string; value: (w: WhiskeyDTO) => string }[] => [
  { label: t("compare.brand"), value: (w) => w.brand },
  { label: t("whiskey.type"), value: (w) => w.type },
  { label: t("whiskey.distillery"), value: (w) => w.distillery },
  {
    label: t("whiskey.region"),
    value: (w) => (w.subRegion ? `${w.region} (${w.subRegion})` : w.region),
  },
  { label: t("whiskey.country"), value: (w) => w.country },
  { label: t("whiskey.abv"), value: (w) => `%${w.abv}` },
  {
    label: t("whiskey.age"),
    value: (w) => (w.age != null ? t("whiskey.ageYears", { age: w.age }) : EMPTY),
  },
  { label: t("whiskey.caskType"), value: (w) => w.caskType ?? EMPTY },
  {
    label: t("whiskey.bottlingYear"),
    value: (w) => (w.bottlingYear != null ? String(w.bottlingYear) : EMPTY),
  },
  { label: t("whiskey.vintage"), value: (w) => (w.vintage != null ? String(w.vintage) : EMPTY) },
  {
    label: t("catalogue.limitedEdition"),
    value: (w) => (w.limitedEdition ? t("common.yes") : t("common.no")),
  },
];

/**
 * Viskileri yan yana karşılaştıran tablo.
 *
 * Ortak aroma notaları altın rozetle vurgulanır — karşılaştırmanın asıl
 * değeri burada, "hangi notalar örtüşüyor" sorusunda. Rozet metni ayrıca
 * "ortak" ibaresi taşır, yani ayrım yalnızca renge dayanmaz.
 */
export function ComparisonTable({ whiskeys }: ComparisonTableProps) {
  const t = getTranslations();
  const specRows = buildSpecRows(t);
  const slugs = whiskeys.map((w) => w.slug);
  const sharedFlavors = findSharedFlavors(whiskeys.map((w) => w.flavorProfile));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">
          {t("compare.tableCaption")}
        </caption>

        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 w-36 bg-card p-3 text-left align-bottom"
            >
              <span className="sr-only">{t("compare.property")}</span>
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
                    className="flex min-h-11 items-center font-serif text-base font-semibold leading-snug hover:text-primary md:min-h-0"
                  >
                    {whiskey.name}
                  </Link>
                  <Link
                    href={buildCompareHref(slugs.filter((s) => s !== whiskey.slug))}
                    className="inline-flex min-h-11 items-center gap-1 text-xs font-normal text-muted-foreground hover:text-destructive-foreground md:min-h-0"
                  >
                    <X className="h-3 w-3" aria-hidden />
                    {t("compare.remove")}
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {specRows.map((row) => (
            <tr key={row.label}>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-card p-3 text-left font-medium text-muted-foreground"
              >
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
            <th
              scope="row"
              className="sticky left-0 z-10 bg-card p-3 text-left font-medium text-muted-foreground"
            >
              {t("whiskey.flavorProfile")}
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
                          title={isShared ? t("compare.sharedNoteTitle") : undefined}
                        >
                          {flavor}
                          {isShared && <span className="ml-1 opacity-80">· {t("compare.sharedLabel")}</span>}
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
