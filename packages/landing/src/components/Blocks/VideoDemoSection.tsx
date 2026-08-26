import { SITE_CONTENT } from "@challenger-fantasy/core";

interface VideoDemoSectionProps {
  videoUrl?: string;
}

const VideoDemoSection = ({ videoUrl }: VideoDemoSectionProps) => {
  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8 bg-accent/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            See It In Action
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {SITE_CONTENT.LANDING.VIDEO_DEMO_TITLE}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            {SITE_CONTENT.LANDING.VIDEO_DEMO_SUBTEXT}
          </p>
        </div>

        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50">
          {videoUrl ? (
            <iframe
              src={videoUrl}
              title="Demo video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                <svg
                  className="w-7 h-7 text-primary ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">Video coming soon</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { VideoDemoSection };
