import { cn } from "@/lib/utils";

interface HeroSectionProps {
  className?: string;
}

function DashboardHeader({ className }: HeroSectionProps) {
  return (
    <section className={cn("mb-4", className)}>
      <h1 className="text-4xl font-bold text-foreground border-b border-border pb-4">Dashboard</h1>
    </section>
  );
}

export { DashboardHeader as DashboardHeaderSection };
