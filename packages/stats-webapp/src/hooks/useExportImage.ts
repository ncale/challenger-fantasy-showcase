import { toBlob } from "html-to-image";
import { useCallback } from "react";
import { toast } from "sonner";

type ShareOptions = {
  filename?: string;
  title?: string;
  text?: string;
  pixelRatio?: number;
};

export function useExportImage<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { filename = "export.png", title, text, pixelRatio = 2 }: ShareOptions = {},
) {
  const generateBlob = useCallback(async (): Promise<Blob | null> => {
    const node = ref.current;
    if (!node) return null;

    try {
      const blob = await toBlob(node, {
        pixelRatio,
        filter: (el) => !(el as HTMLElement).classList?.contains("no-export"),
      });
      return blob;
    } catch (e) {
      console.error(e);
      toast.error("Unable to generate image");
      return null;
    }
  }, [ref, pixelRatio]);

  const share = useCallback(async () => {
    try {
      const blob = await generateBlob();
      if (!blob) return;

      const file = new File([blob], filename, { type: "image/png" });

      const shareData: Record<string, unknown> = { files: [file] };
      if (title && title.trim().length > 0) shareData.title = title;
      if (text && text.trim().length > 0) shareData.text = text;

      if (navigator?.canShare?.(shareData)) {
        await navigator.share?.(shareData);
        toast.success("Image shared");
        return;
      }
    } catch (e) {
      console.error(e);
      toast.error("Unable to share image");
    }
  }, [generateBlob, filename, title, text]);

  const downloadFromBlob = useCallback(
    async (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    },
    [filename],
  );

  const download = useCallback(async () => {
    try {
      const blob = await generateBlob();
      if (!blob) return;

      await downloadFromBlob(blob);
    } catch (e) {
      console.error(e);
      toast.error("Unable to download image");
    }
  }, [generateBlob, downloadFromBlob]);

  return { share, download };
}
