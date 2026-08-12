import { getTranslations } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { whiskeyService } from "@/server/services/WhiskeyService";
import { Button } from "@/components/ui/button";
import { WhiskeyForm } from "@/components/admin/WhiskeyForm";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("admin.editWhiskeyTitle") };
}
export const dynamic = "force-dynamic";

interface EditWhiskeyPageProps {
  params: { slug: string };
}

export default async function EditWhiskeyPage({ params }: EditWhiskeyPageProps) {
  await connectToDatabase();

  const whiskey = await whiskeyService.findWhiskeyBySlug(params.slug);
  if (!whiskey) notFound();

  const t = getTranslations();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/whiskeys">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("whiskey.backToCatalogue")}
        </Link>
      </Button>

      <div>
        <h2 className="font-serif text-2xl font-bold">
          {whiskey.brand} — {whiskey.name}
        </h2>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{whiskey.slug}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("admin.editWhiskeyHint")}
        </p>
      </div>

      <WhiskeyForm whiskey={whiskey} />
    </div>
  );
}
