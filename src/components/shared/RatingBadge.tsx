import { cn } from "@/lib/utils/cn";

interface RatingBadgeProps {
  rating: number; // 0-100
  size?: "sm" | "lg";
}

/** 0-100 puanı renk kodlu rozet olarak gösterir. */
export function RatingBadge({ rating, size = "sm" }: RatingBadgeProps) {
  const tone =
    rating >= 90
      ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
      : rating >= 75
        ? "border-primary/40 bg-primary/10 text-primary"
        : rating >= 50
          ? "border-border bg-secondary text-secondary-foreground"
          : "border-border bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-semibold tabular-nums",
        tone,
        size === "lg" ? "h-14 w-14 text-lg" : "h-9 w-9 text-xs"
      )}
      title={`Puan: ${rating}/100`}
    >
      {rating}
    </span>
  );
}
