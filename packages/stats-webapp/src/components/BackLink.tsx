import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/Buttons/Button";
import { cn } from "@/lib/utils";

type BackLinkKind =
  | {
      kind: "back" | "home";
    }
  | {
      kind: "route";
      to: LinkProps["to"];
    };

interface BackLinkProps {
  backLinkKind?: BackLinkKind;
}

export function BackLink({ backLinkKind }: BackLinkProps) {
  const handleBack = () => window.history.back();

  if (!backLinkKind || backLinkKind.kind === "back") {
    return (
      <button
        onClick={handleBack}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        type="button"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>
    );
  }

  const to = ((): LinkProps["to"] => {
    if (backLinkKind.kind === "home") return "/";
    if (backLinkKind.kind === "route") return backLinkKind.to;
    throw new Error("Invalid kind");
  })();

  return (
    <Link to={to} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
      <ArrowLeft className="w-4 h-4 mr-1" />
      {backLinkKind.kind === "home" ? "Home" : "Back"}
    </Link>
  );
}
