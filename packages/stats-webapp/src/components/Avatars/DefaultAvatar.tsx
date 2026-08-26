import { User } from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR_BG_COLORS = [
  "from-blue-100 to-blue-300",
  "from-sky-100 to-sky-300",
  "from-emerald-100 to-emerald-300",
  "from-cyan-100 to-cyan-300",
];

const AVATAR_USER_COLORS = ["text-blue-700", "text-sky-700", "text-emerald-700", "text-cyan-700"];

const SIZE_CLASSES = {
  sm: {
    container: "w-8 h-8",
    icon: "w-4 h-4",
  },
  lg: {
    container: "w-16 h-16",
    icon: "w-8 h-8",
  },
};

interface DefaultAvatarProps {
  text: string;
  size?: "sm" | "lg";
  className?: string;
}

export function DefaultAvatar({ text, size = "lg", className }: DefaultAvatarProps) {
  // Get consistent color based on text
  const colorIndex =
    Math.abs(text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
    AVATAR_BG_COLORS.length;

  const gradientColors = AVATAR_BG_COLORS[colorIndex];
  const userColors = AVATAR_USER_COLORS[colorIndex];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center bg-gradient-to-br",
        gradientColors,
        SIZE_CLASSES[size].container,
        className,
      )}
    >
      <User className={cn(userColors, SIZE_CLASSES[size].icon)} />
    </div>
  );
}
