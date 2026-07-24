import { cn } from "@/lib/utils/cn";

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-base",
  lg: "h-20 w-20 text-2xl",
};

/** İsmin baş harflerini alır (en fazla iki harf). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Kullanıcı avatarı — fotoğraf varsa gösterir, yoksa baş harfleri. */
export function UserAvatar({ name, src, size = "md" }: UserAvatarProps) {
  const base = cn(
    "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
    SIZES[size]
  );

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className={cn(base, "object-cover")} loading="lazy" />
    );
  }

  return (
    <span className={cn(base, "bg-primary/15 text-primary")} aria-label={name}>
      {initials(name)}
    </span>
  );
}
