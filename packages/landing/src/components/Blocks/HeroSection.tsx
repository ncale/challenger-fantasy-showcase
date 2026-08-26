interface HeroSectionProps {
  heading: string;
  description: string;
  heroImage?: string;
  appStoreUrl: string;
}

const HeroSection = ({ heading, description, heroImage, appStoreUrl }: HeroSectionProps) => {
  return (
    <section className="pt-32 pb-16 lg:pt-36 lg:pb-28 px-6 sm:px-8 mx-auto w-full max-w-7xl">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Text column */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] whitespace-pre-line">
            {heading}
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl mt-6 mb-8 max-w-lg whitespace-pre-line leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col items-center lg:items-start gap-4">
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-opacity"
            >
              <img
                src="/Download_on_App_Store/White_lockup/SVG/Download_on_the_App_Store_Badge_US-UK_RGB_wht_092917.svg"
                alt="Download on the App Store"
                className="h-14"
              />
            </a>
          </div>
        </div>

        {/* Image column */}
        <div className="flex-1 flex justify-center lg:justify-end self-stretch">
          {heroImage ? (
            <div className="w-full max-w-[260px] sm:max-w-xs lg:max-w-sm self-stretch overflow-hidden rounded-3xl shadow-2xl">
              <img
                src={heroImage}
                alt="App preview"
                className="w-full h-full object-cover object-top"
              />
            </div>
          ) : (
            <div
              className="w-full max-w-lg lg:max-w-xl aspect-video bg-muted rounded-2xl
                          flex items-center justify-center border border-border shadow-2xl"
            >
              <span className="text-muted-foreground text-sm text-center px-4">
                Hero image coming soon
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
