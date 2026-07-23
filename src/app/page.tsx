import Link from "next/link";
import { BookOpenText, Compass, Heart, NotebookPen } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Compass,
    title: "Keşfedin",
    description: "Dünya viskilerinin yer aldığı merkezi katalogda markaya, bölgeye ve tipe göre arama yapın.",
  },
  {
    icon: NotebookPen,
    title: "Kaydedin",
    description: "Her tadım seansını burun, damak ve bitiş notlarıyla, aroma çarkından seçtiğiniz etiketlerle kaydedin.",
  },
  {
    icon: BookOpenText,
    title: "Karşılaştırın",
    description: "Aynı viskiye ait tadımlarınızı zaman içinde karşılaştırın, damak zevkinizin evrimini izleyin.",
  },
  {
    icon: Heart,
    title: "Favorileyin",
    description: "En sevdiğiniz tadımları işaretleyin, kişisel viski hafızanızı oluşturun.",
  },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">
          Premium Viski Tadım Günlüğü
        </p>
        <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-6xl">
          Her yudum <span className="text-gold-gradient">bir hatıra</span>, her şişe bir hikâye.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          CaskKeeper ile viskileri keşfedin, tadım deneyimlerinizi zarif bir günlükte saklayın ve
          damak zevkinizin yolculuğunu izleyin.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {session ? (
            <>
              <Button asChild size="lg">
                <Link href="/panel">Panelime Git</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/viskiler">Kataloğa Göz At</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/kayit">Ücretsiz Başlayın</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/viskiler">Kataloğa Göz At</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Özellikler */}
      <section className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
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
