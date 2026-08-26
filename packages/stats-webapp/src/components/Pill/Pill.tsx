import { cn } from "@/lib/utils";

interface PillProps {
  children: React.ReactNode;
  className?: string;
  color?: "green" | "red" | "blue" | "gray" | "champion-gold";
  size?: "sm" | "md" | "lg";
  variant?: "circular" | "regular";
}

export function Pill({
  children,
  className,
  color = "gray",
  size = "md",
  variant = "circular",
}: PillProps) {
  const circularSizeClasses = {
    sm: "w-4 h-4 text-[10px]",
    md: "w-6 h-6 text-xs",
    lg: "w-8 h-8 text-sm",
  };

  const regularSizeClasses = {
    sm: "h-4 px-1.5 text-[10px]",
    md: "h-6 px-2 text-xs",
    lg: "h-8 px-3 text-sm",
  };

  const colorClasses = {
    green: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
    red: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
    blue: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
    gray: "bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100",
    "champion-gold": "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
  };

  return (
    <div
      className={cn(
        "rounded-full inline-flex items-center justify-center font-medium",
        variant === "circular" ? circularSizeClasses[size] : regularSizeClasses[size],
        colorClasses[color],
        className,
      )}
    >
      {children}
    </div>
  );
}
