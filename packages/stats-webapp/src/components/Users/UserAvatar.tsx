import { Link } from "@tanstack/react-router";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatars/Avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  userId: string;
  username?: string;
  avatarUrl?: string | null;
  size?: "sm" | "lg";
  disableLink?: boolean;
  className?: string;
}

export function UserAvatar({
  userId,
  username,
  avatarUrl,
  size = "sm",
  disableLink = false,
  className,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "size-8",
    lg: "size-16",
  };

  const altText = username ? `${username}'s avatar` : "User avatar";

  const avatar = (
    <Avatar className={cn(sizeClasses[size], className)} square>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={altText} />}
      <AvatarFallback square>
        <User className={size === "sm" ? "size-4" : "size-8"} />
      </AvatarFallback>
    </Avatar>
  );

  if (disableLink) {
    return avatar;
  }

  return (
    <Link to="/users/$userId" params={{ userId }}>
      {avatar}
    </Link>
  );
}
