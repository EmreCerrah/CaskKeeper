import { GlassWater } from "lucide-react";
import { getTranslations } from "@/lib/i18n/server";

export function Footer() {
  const t = getTranslations();

  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground sm:px-6">
        <div className="flex items-center gap-2">
          <GlassWater className="h-4 w-4 text-primary" aria-hidden />
          <span className="font-serif font-semibold text-foreground">CaskKeeper</span>
        </div>
        <p>{t("footer.tagline")}</p>
        <p className="text-xs">
          {t("footer.disclaimer")} © {new Date().getFullYear()} CaskKeeper
        </p>
      </div>
    </footer>
  );
}
