import { SITE_CONTENT } from "@challenger-fantasy/core";

const features = [
  {
    label: "Upcoming UFC events and fight cards",
    detail: "See who's fighting, when, and where.",
  },
  {
    label: "Detailed fighter profiles and records",
    detail: "Win/loss history, striking stats, and more.",
  },
  {
    label: "Historical fight data and statistics",
    detail: "Every bout, every round, every stat.",
  },
];

const StatsPreviewSection = () => {
  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Fighter Stats
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {SITE_CONTENT.LANDING.STATS_PREVIEW_SECTION_TITLE}
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {SITE_CONTENT.LANDING.STATS_PREVIEW_SECTION_SUBTEXT}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {features.map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <svg
                  className="w-3.5 h-3.5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-snug mb-1">{f.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { StatsPreviewSection };
