interface FinalCTAProps {
  heading: string;
  appStoreUrl: string;
}

const FinalCTA = ({ heading, appStoreUrl }: FinalCTAProps) => {
  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-accent rounded-2xl p-10 sm:p-14 flex flex-col items-center gap-6 text-center shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">{heading}</h2>

          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-opacity"
          >
            <img
              src="/Download_on_App_Store/Black_lockup/SVG/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
              alt="Download on the App Store"
              className="h-14"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export { FinalCTA };
