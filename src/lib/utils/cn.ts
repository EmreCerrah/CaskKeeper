import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Conditionally merges Tailwind classes (the shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
