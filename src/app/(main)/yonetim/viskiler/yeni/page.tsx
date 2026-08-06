import { getTranslations } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhiskeyForm } from "@/components/admin/WhiskeyForm";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("admin.newWhiskeyTitle") };
}

export default function NewWhiskeyPage() {
  const t = getTranslations();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/yonetim/viskiler">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("whiskey.backToCatalogue")}
        </Link>
      </Button>

      <div>
        <h2 className="font-serif text-2xl font-bold">{t("admin.newWhiskeyTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("admin.newWhiskeyHint")}
        </p>
      </div>

      <WhiskeyForm />
    </div>
  );
}
