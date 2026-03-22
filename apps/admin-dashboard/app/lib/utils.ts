import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution — the Shadcn standard. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
