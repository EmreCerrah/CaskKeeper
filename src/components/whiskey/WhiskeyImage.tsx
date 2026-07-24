"use client";

import { useState } from "react";
import { GlassWater } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface WhiskeyImageProps {
  src?: string;
  alt: string;
  className?: string;
}

/**
 * Viski görseli — dış kaynak URL'leri kırık olabileceği için
 * onError fallback'li düz <img> kullanır (harici domain whitelist gerektirmez).
 */
export function WhiskeyImage({ src, alt, className }: WhiskeyImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-accent to-secondary",
          className
        )}
        aria-label={alt}
      >
        <GlassWater className="h-12 w-12 text-primary/40" aria-hidden />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
