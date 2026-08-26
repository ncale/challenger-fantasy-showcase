import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

interface HeaderLogoProps {
  withLink?: boolean;
  column?: boolean;
  size?: "sm" | "full";
}

export function HeaderLogo({ withLink = false, column = false, size = "full" }: HeaderLogoProps) {
  const HeaderLogo = (
    <>
      <img
        src="/wreath-logo-w.svg"
        alt="Challenger Fantasy Logo"
        className={cn("size-10 invert dark:invert-0", size === "sm" && "size-8")}
      />
      <h1
        className={cn(
          "text-xl font-bold text-foreground uppercase select-none",
          column ? "mt-2" : "ml-2",
          size === "sm" && "text-lg",
        )}
      >
        Challenger
      </h1>
    </>
  );

  const headerLogoClass = cn("flex-shrink-0 flex items-center relative", column && "flex-col");

  if (withLink) {
    return (
      <Link to="/" className={headerLogoClass}>
        {HeaderLogo}
      </Link>
    );
  }

  return <div className={headerLogoClass}>{HeaderLogo}</div>;
}
