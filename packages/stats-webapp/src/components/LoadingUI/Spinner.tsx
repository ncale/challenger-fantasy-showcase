import { cn } from "@/lib/utils";

const SPINNER_SIZES = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
  xl: "h-12 w-12 border-3",
} as const;

interface SpinnerProps {
  size?: keyof typeof SPINNER_SIZES;
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-current border-t-transparent",
        SPINNER_SIZES[size],
        className,
      )}
    />
  );
}
