import { GlassWater } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground sm:px-6">
        <div className="flex items-center gap-2">
          <GlassWater className="h-4 w-4 text-primary" aria-hidden />
          <span className="font-serif font-semibold text-foreground">CaskKeeper</span>
        </div>
        <p>Viski tadım günlüğünüz — keşfedin, tadın, kaydedin.</p>
        <p className="text-xs">
          İçkinin tadını çıkarın, sorumlu tüketin. © {new Date().getFullYear()} CaskKeeper
        </p>
      </div>
    </footer>
  );
}
