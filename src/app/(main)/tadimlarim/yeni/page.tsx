import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { whiskeyService } from "@/server/services/WhiskeyService";
import { Button } from "@/components/ui/button";
import { TastingNoteForm } from "@/components/tasting/TastingNoteForm";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("noteForm.newTitle") };
}
export const dynamic = "force-dynamic";

interface NewTastingPageProps {
  searchParams: { viski?: string };
}

export default async function NewTastingPage({ searchParams }: NewTastingPageProps) {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/tadimlarim/yeni");

  // Viski seçilmeden not yazılamaz — katalogdan seçime yönlendir
  if (!searchParams.viski) redirect("/viskiler");

  await connectToDatabase();
  const whiskey = await whiskeyService.findWhiskeyBySlug(searchParams.viski);
  if (!whiskey) redirect("/viskiler");

  const t = getTranslations();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/viskiler/${whiskey.slug}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("noteForm.backToWhiskey")}
        </Link>
      </Button>

      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {t("noteForm.newTitle")}
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold">
          {whiskey.brand} <span className="text-gold-gradient">{whiskey.name}</span>
        </h1>
      </div>

      <TastingNoteForm whiskey={whiskey} />
    </div>
  );
}
