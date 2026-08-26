import { type ClassValue, clsx } from "clsx";
import { version } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// COMPATIBILITY AND OTHER REACT UTILS

const inertBooleanSupported = Number(version.split(".")[0]) >= 19;

export const isInert = inertBooleanSupported
  ? (x: boolean) => x
  : (x: boolean) => (x ? "" : undefined) as unknown as boolean;
