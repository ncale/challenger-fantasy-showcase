import { useCallback } from "react";
import { toast } from "sonner";

export function useShareLink() {
  const share = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        url,
        title: document.title,
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  }, []);

  const copy = useCallback(async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }, []);

  return { share, copy };
}
