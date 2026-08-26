// This component is used to show a small tidbit of information beneath some component or card.

export function SummaryPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 text-center">
      <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
        {children}
      </div>
    </div>
  );
}
