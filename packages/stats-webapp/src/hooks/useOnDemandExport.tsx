import { type CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import { WatermarkPill } from "@/components/Watermark/WatermarkPill";
import { cn, isInert } from "@/lib/utils";

type WatermarkPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type UseOnDemandExportOptions = {
  width: number;
  height: number | undefined;
  className?: string;
  style?: CSSProperties;
  watermarkPosition?: WatermarkPosition;
};

export function useOnDemandExport({
  width,
  height,
  className,
  style,
  watermarkPosition = "top-right",
}: UseOnDemandExportOptions) {
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const prepareExport = useCallback(async () => {
    setIsExporting(true);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  }, []);

  const cleanupExport = useCallback(async () => {
    setIsExporting(false);
  }, []);

  const getWatermarkStyles = useCallback((position: WatermarkPosition): string => {
    switch (position) {
      case "top-left":
        return "top-2 left-2";
      case "top-right":
        return "top-2 right-2";
      case "bottom-left":
        return "bottom-2 left-2";
      case "bottom-right":
        return "bottom-2 right-2";
    }
  }, []);

  const OffscreenExport = useMemo(() => {
    const Component = ({ children }: { children: React.ReactNode }) => {
      if (!isExporting) return null;

      return (
        <div
          aria-hidden="true"
          inert={isInert(true)}
          className="fixed"
          style={{ left: -20000, top: -20000 }}
        >
          <div
            ref={exportRef}
            className={cn("relative bg-background", className)}
            style={{ width, height, ...(style ?? {}) }}
          >
            {children}
            <div className={cn("absolute", getWatermarkStyles(watermarkPosition))}>
              <WatermarkPill />
            </div>
          </div>
        </div>
      );
    };
    return Component;
  }, [isExporting, width, height, className, style, watermarkPosition, getWatermarkStyles]);

  return { exportRef, isExporting, prepareExport, cleanupExport, OffscreenExport };
}
