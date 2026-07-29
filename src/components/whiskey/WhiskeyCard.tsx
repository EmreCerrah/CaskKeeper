import Link from "next/link";
import { MapPin } from "lucide-react";
import type { WhiskeyDTO } from "@/lib/types/dto";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WhiskeyImage } from "./WhiskeyImage";

interface WhiskeyCardProps {
  whiskey: WhiskeyDTO;
}

/** Katalog listesindeki viski kartı. */
export function WhiskeyCard({ whiskey }: WhiskeyCardProps) {
  return (
    <Link href={`/viskiler/${whiskey.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
        <WhiskeyImage
          src={whiskey.imageUrl}
          alt={`${whiskey.brand} ${whiskey.name}`}
          className="h-44 w-full"
        />
        <div className="space-y-2 p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {whiskey.brand}
          </p>
          <h3 className="font-serif text-lg font-semibold leading-snug group-hover:text-primary">
            {whiskey.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden />
            <span>
              {whiskey.region}, {whiskey.country}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Badge variant="gold">{whiskey.type}</Badge>
            {whiskey.age != null && <Badge variant="secondary">{whiskey.age} Yıl</Badge>}
            <Badge variant="outline">%{whiskey.abv} ABV</Badge>
            {whiskey.limitedEdition && <Badge>Limitli Üretim</Badge>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
