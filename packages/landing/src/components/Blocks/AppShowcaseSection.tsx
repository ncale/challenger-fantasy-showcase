import { SITE_CONTENT } from "@challenger-fantasy/core";

interface AppScreen {
  image?: string;
  caption: string;
}

interface AppShowcaseSectionProps {
  screens?: AppScreen[];
}

const defaultScreens: AppScreen[] = [
  { caption: "Live Draft" },
  { caption: "Track Your Score" },
  { caption: "Leaderboards" },
];

const AppShowcaseSection = ({ screens = defaultScreens }: AppShowcaseSectionProps) => {
  return (
    <section className="py-20 sm:py-28 bg-accent/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 px-6 sm:px-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            The App
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {SITE_CONTENT.LANDING.APP_SHOWCASE_TITLE}
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {SITE_CONTENT.LANDING.APP_SHOWCASE_SUBTEXT}
          </p>
        </div>

        <div className="flex gap-6 lg:gap-10 overflow-x-auto lg:overflow-visible lg:justify-center pb-4 lg:pb-0 snap-x snap-mandatory lg:snap-none px-6 sm:px-8">
          {screens.map((screen) => (
            <div
              key={screen.caption}
              className="flex-shrink-0 snap-center flex flex-col items-center"
            >
              {screen.image ? (
                <img
                  src={screen.image}
                  alt={screen.caption}
                  className="w-48 lg:w-56 rounded-3xl shadow-xl"
                />
              ) : (
                <div className="w-48 lg:w-56 aspect-[9/19.5] bg-muted rounded-3xl flex items-center justify-center border border-border shadow-xl">
                  <span className="text-muted-foreground text-sm text-center px-4">
                    Coming soon
                  </span>
                </div>
              )}
              <p className="mt-4 text-sm font-medium text-center text-muted-foreground">
                {screen.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { AppShowcaseSection };
