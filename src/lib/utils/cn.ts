import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind sınıflarını koşullu birleştirir (shadcn/ui standardı). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
