import { cn } from "@/lib/utils";

interface WatermarkPillProps {
  className?: string;
}

export function WatermarkPill({ className }: WatermarkPillProps) {
  return (
    <div className={cn("flex items-center text-xs font-medium rounded-full py-0 px-1", className)}>
      <span className="text-muted-foreground italic font-medium">ChallengerFantasy.com</span>
    </div>
  );
}
