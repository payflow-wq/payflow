import clsx, { type ClassValue } from "clsx";

/** Joins conditional class names. Thin wrapper so call sites read cleanly. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
