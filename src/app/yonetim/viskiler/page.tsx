import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { whiskeyService } from "@/server/services/WhiskeyService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/shared/Pagination";
import { DeleteWhiskeyButton } from "@/components/admin/DeleteWhiskeyButton";

export const metadata: Metadata = { title: "Katalog Yönetimi" };
export const dynamic = "force-dynamic";

interface AdminCatalogPageProps {
  searchParams: { sayfa?: string };
}

export default async function AdminCatalogPage({ searchParams }: AdminCatalogPageProps) {
  await connectToDatabase();

  const page = Math.max(1, Number(searchParams.sayfa) || 1);
  const result = await whiskeyService.getAllWhiskeys(undefined, {
    page,
    limit: 20,
    sortBy: "brand",
    sortOrder: "asc",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Katalogda <span className="font-medium text-foreground">{result.total}</span> viski var.
        </p>
        <Button asChild>
          <Link href="/yonetim/viskiler/yeni">
            <Plus className="h-4 w-4" aria-hidden />
            Yeni Viski
          </Link>
        </Button>
      </div>

      {result.data.length > 0 ? (
        <>
          <div className="space-y-2">
            {result.data.map((whiskey) => (
              <Card key={whiskey.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={`/viskiler/${whiskey.slug}`}
                    className="block truncate font-serif font-semibold hover:text-primary"
                  >
                    {whiskey.brand} — {whiskey.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="gold">{whiskey.type}</Badge>
                    <Badge variant="outline">
                      {whiskey.region}, {whiskey.country}
                    </Badge>
                    <Badge variant="secondary">%{whiskey.abv}</Badge>
                    {whiskey.age != null && <Badge variant="secondary">{whiskey.age} Yıl</Badge>}
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">{whiskey.slug}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button asChild variant="ghost" size="icon" title="Düzenle">
                    <Link href={`/yonetim/viskiler/${whiskey.slug}/duzenle`}>
                      <Pencil className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </Link>
                  </Button>
                  <DeleteWhiskeyButton
                    slug={whiskey.slug}
                    label={`${whiskey.brand} ${whiskey.name}`}
                  />
                </div>
              </Card>
            ))}
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/yonetim/viskiler"
          />
        </>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <p className="font-medium">Katalog boş.</p>
          <p className="mt-1 text-sm">Yeni viski ekleyin veya import script’ini çalıştırın.</p>
        </div>
      )}
    </div>
  );
}
