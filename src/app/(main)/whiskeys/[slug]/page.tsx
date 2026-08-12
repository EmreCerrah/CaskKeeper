import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Columns3, ExternalLink, MapPin, NotebookPen } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { whiskeyService } from "@/server/services/WhiskeyService";
import { tastingNoteService } from "@/server/services/TastingNoteService";
import { wishlistService } from "@/server/services/WishlistService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhiskeyImage } from "@/components/whiskey/WhiskeyImage";
import { WishlistButton } from "@/components/whiskey/WishlistButton";
import { TastingNoteCard } from "@/components/tasting/TastingNoteCard";
import { buildCompareHref } from "@/lib/utils/comparison";
import { getTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

interface WhiskeyDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: WhiskeyDetailPageProps): Promise<Metadata> {
  await connectToDatabase();
  const whiskey = await whiskeyService.findWhiskeyBySlug(params.slug);
  return { title: whiskey ? `${whiskey.brand} ${whiskey.name}` : getTranslations()("whiskey.notFound") };
}

export default async function WhiskeyDetailPage({ params }: WhiskeyDetailPageProps) {
  await connectToDatabase();

  const whiskey = await whiskeyService.findWhiskeyBySlug(params.slug);
  if (!whiskey) notFound();

  const session = await getSession();
  const [myNotes, isWishlisted] = await Promise.all([
    session ? tastingNoteService.getNotesForWhiskey(session.userId, whiskey.id) : Promise.resolve([]),
    session ? wishlistService.isWishlisted(session.userId, whiskey.id) : Promise.resolve(false),
  ]);

  const t = getTranslations();

  const specs: { label: string; value: string }[] = [
    { label: t("whiskey.type"), value: whiskey.type },
    { label: t("whiskey.abv"), value: `%${whiskey.abv}` },
    ...(whiskey.age != null ? [{ label: t("whiskey.age"), value: t("whiskey.ageYears", { age: whiskey.age }) }] : []),
    ...(whiskey.distillery ? [{ label: t("whiskey.distillery"), value: whiskey.distillery }] : []),
    ...(whiskey.caskType ? [{ label: t("whiskey.caskType"), value: whiskey.caskType }] : []),
    ...(whiskey.bottlingYear ? [{ label: t("whiskey.bottlingYear"), value: String(whiskey.bottlingYear) }] : []),
    ...(whiskey.vintage ? [{ label: t("whiskey.vintage"), value: String(whiskey.vintage) }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/whiskeys">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("whiskey.backToCatalogue")}
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Görsel */}
        <WhiskeyImage
          src={whiskey.imageUrl}
          alt={`${whiskey.brand} ${whiskey.name}`}
          className="h-80 w-full rounded-lg border lg:h-[420px]"
        />

        {/* Bilgiler — min-w-0: grid öğesinin içeriğinden dar olabilmesi için
            (bkz. panel sayfasındaki aynı düzeltme) */}
        <div className="min-w-0 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {whiskey.brand}
            </p>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">{whiskey.name}</h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden />
              {whiskey.region}
              {whiskey.subRegion ? ` (${whiskey.subRegion})` : ""}, {whiskey.country}
            </p>
            {whiskey.limitedEdition && <Badge>{t("catalogue.limitedEdition")}</Badge>}
          </div>

          {whiskey.description && (
            <p className="leading-relaxed text-muted-foreground">{whiskey.description}</p>
          )}

          {/* Teknik özellikler */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specs.map((spec) => (
              <div key={spec.label} className="rounded-md border bg-card/60 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">{spec.label}</p>
                <p className="text-sm font-medium">{spec.value}</p>
              </div>
            ))}
          </div>

          {/* Aroma profili */}
          {whiskey.flavorProfile.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("whiskey.flavorProfile")}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {whiskey.flavorProfile.map((flavor) => (
                  <Badge key={flavor} variant="gold">
                    {flavor}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ödüller */}
          {whiskey.awards.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("whiskey.awards")}
              </h2>
              <ul className="space-y-1">
                {whiskey.awards.map((award) => (
                  <li key={award} className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {award}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <Link href={session ? `/my-tastings/new?whisky=${whiskey.slug}` : `/sign-in?return=/whiskeys/${whiskey.slug}`}>
                <NotebookPen className="h-4 w-4" aria-hidden />
                {t("whiskey.writeNote")}
              </Link>
            </Button>
            {session ? (
              <WishlistButton whiskeyId={whiskey.id} initialWishlisted={isWishlisted} />
            ) : (
              <Button asChild variant="outline" size="lg">
                <Link href={`/sign-in?return=/whiskeys/${whiskey.slug}`}>
                  {t("whiskey.wishlistAdd")}
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg">
              <Link href={buildCompareHref([whiskey.slug])}>
                <Columns3 className="h-4 w-4" aria-hidden />
                {t("nav.compare")}
              </Link>
            </Button>
            {whiskey.officialUrl && (
              <Button asChild variant="outline" size="lg">
                <a href={whiskey.officialUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  {t("whiskey.officialPage")}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Kullanıcının bu viskiye ait tadımları */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">
              {t("whiskey.myNotesTitle")} {myNotes.length > 0 && `(${myNotes.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myNotes.length > 0 ? (
              myNotes.map((note) => <TastingNoteCard key={note.id} note={note} hideWhiskey />)
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("whiskey.noNotesYet")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
