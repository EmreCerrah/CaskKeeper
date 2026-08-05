import Link from "next/link";
import { BookOpenText, Compass, Heart, NotebookPen } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "@/lib/i18n/server";
import type { Translator } from "@/lib/i18n/translate";

/**
 * Tanıtım kartları. Metinler çevrildiği için sabit dizi değil, t()'yi alan bir
 * fonksiyon — aynı desen LoginForm'daki Zod şemasında ve ComparisonTable'daki
 * satır tanımlarında da kullanılıyor.
 */
const buildFeatures = (t: Translator) => [
  {
    icon: Compass,
    title: t("home.feature.discover.title"),
    description: t("home.feature.discover.body"),
  },
  {
    icon: NotebookPen,
    title: t("home.feature.record.title"),
    description: t("home.feature.record.body"),
  },
  {
    icon: BookOpenText,
    title: t("home.feature.compare.title"),
    description: t("home.feature.compare.body"),
  },
  {
    icon: Heart,
    title: t("home.feature.favorite.title"),
    description: t("home.feature.favorite.body"),
  },
];

export default async function HomePage() {
  const session = await getSession();
  const t = getTranslations();
  const features = buildFeatures(t);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
          {t("home.eyebrow")}
        </p>
        <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-6xl">
          {/* Vurgulanan kelime cümlenin ortasında olduğu için başlık üç parçaya
              ayrıldı; tek metin olsaydı çeviride kelime sırası değiştirilemezdi. */}
          {t("home.headlineBefore")}{" "}
          <span className="text-gold-gradient">{t("home.headlineHighlight")}</span>
          {t("home.headlineAfter")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t("home.subtitle")}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {session ? (
            <>
              <Button asChild size="lg">
                <Link href="/panel">{t("home.ctaDashboard")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/viskiler">{t("home.ctaCatalogue")}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/kayit">{t("home.ctaSignUp")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/viskiler">{t("home.ctaCatalogue")}</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Özellikler */}
      <section className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-card/60">
            <CardContent className="space-y-3 pt-6">
              <feature.icon className="h-8 w-8 text-primary" aria-hidden />
              <h2 className="font-serif text-lg font-semibold">{feature.title}</h2>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
