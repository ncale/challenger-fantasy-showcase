import { Check, ImageIcon, LinkIcon, Share2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useExportImage } from "@/hooks/useExportImage";
import { useShareLink } from "@/hooks/useShareLink";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu/DropdownMenu";
import { type Button, buttonVariants } from "./Button";

type ShareButtonProps<T extends HTMLElement> = {
  targetRef: React.RefObject<T | null>;
  filename: string;
  title?: string;
  text?: string;
  pixelRatio?: number;
  buttonLabel?: string;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  buttonSize?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  onPrepare?: () => void | Promise<void>;
  onCleanup?: () => void | Promise<void>;
};

export function ShareButton<T extends HTMLElement>({
  targetRef,
  filename,
  title,
  text,
  pixelRatio = 2,
  buttonLabel,
  buttonVariant = "ghost",
  buttonSize = "sm",
  className,
  onPrepare,
  onCleanup,
}: ShareButtonProps<T>) {
  const [showCheck, setShowCheck] = useState(false);

  const { copy: copyLink, share: nativeShare } = useShareLink();
  const { download: downloadImage } = useExportImage<T>(targetRef, {
    filename,
    title,
    text,
    pixelRatio,
  });

  const withPreparation = useCallback(
    async (action: () => Promise<void>, shouldShowCheck = false) => {
      try {
        await onPrepare?.();
        await action();
        if (shouldShowCheck) {
          setShowCheck(true);
          setTimeout(() => setShowCheck(false), 1200);
        }
      } finally {
        await onCleanup?.();
      }
    },
    [onPrepare, onCleanup],
  );

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="no-export">
          <div className={cn(buttonVariants({ variant: buttonVariant, size: buttonSize }))}>
            <div className="relative size-4">
              <Check
                className={cn(
                  "absolute inset-0 transition-opacity duration-200",
                  showCheck ? "opacity-100" : "opacity-0",
                )}
              />
              <Share2
                className={cn(
                  "absolute inset-0 transition-opacity duration-200",
                  showCheck ? "opacity-0" : "opacity-100",
                )}
              />
            </div>
            {buttonLabel}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" className="min-w-52">
          <DropdownMenuItem onClick={() => withPreparation(copyLink, true)}>
            <LinkIcon className="size-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => withPreparation(nativeShare, false)}>
            <Share2 className="size-4" />
            Share link via …
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => withPreparation(downloadImage, false)}>
            <ImageIcon className="size-4" />
            Export image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
