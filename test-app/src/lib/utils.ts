/**
 * Merge Tailwind class names conditionally, filtering out falsy values.
 * Kept dependency-free (no clsx/tailwind-merge) to keep the template minimal;
 * swap in `clsx` + `tailwind-merge` if your project grows more complex class logic.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}