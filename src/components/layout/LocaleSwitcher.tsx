"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { persistLocale, useLocale, useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils/cn";

/**
 * TR | EN değiştirici.
 *
 * Oturum açmamış kullanıcıya da görünür olması şart: giriş ve kayıt sayfalarını
 * anlayamayan biri zaten içeri giremez.
 *
 * Tercih çereze yazılır, ardından router.refresh() ile sunucu bileşenleri yeni
 * dille yeniden render edilir — sayfa yenilenmez, bulunulan konum korunur.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const current = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function select(locale: Locale) {
    if (locale === current) return;
    persistLocale(locale);
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={t("locale.label")}
      className={cn(
        "flex items-center rounded-md border border-border/60 p-0.5",
        pending && "opacity-60",
        className
      )}
    >
      {LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-current={active ? "true" : undefined}
            aria-label={locale === "tr" ? t("locale.switchToTr") : t("locale.switchToEn")}
            onClick={() => select(locale)}
            disabled={pending}
            className={cn(
              // Mobilde 44×44 dokunma hedefi (WCAG 2.5.5), masaüstünde kompakt.
              "min-h-11 min-w-11 rounded px-2 text-xs font-semibold uppercase transition-colors md:min-h-0 md:min-w-0 md:py-1",
              // 44px'lik iki düğme 320px'te üst çubuğu taşırıyordu. Mobilde
              // yalnızca GEÇİLECEK dil gösterilir (aktif olan gizlenir), yani
              // kontrol tek düğmeye iner; masaüstünde ikisi de görünür.
              active
                ? "hidden bg-primary text-primary-foreground md:inline-flex"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
