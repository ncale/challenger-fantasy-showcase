import { LINKS } from "@challenger-fantasy/core";

interface HeaderLogoProps {
  withLink?: boolean;
}

export function HeaderLogo({ withLink = true }: HeaderLogoProps) {
  const HeaderLogo = (
    <>
      <img
        src="/wreath-logo-2-w.svg"
        alt="Challenger Fantasy Logo"
        className="w-10 h-10 mr-1.5 invert-0 dark:invert-0"
      />
      <h1 className="flex flex-col items-start justify-center">
        <span className="block leading-none text-xl font-bold text-foreground uppercase">
          Challenger
        </span>
        <span className="block leading-none italic font-medium text-green-400">Stats</span>
      </h1>
    </>
  );

  if (withLink) {
    return (
      <a href={LINKS.LANDING_URL} className="flex-shrink-0 flex items-center relative">
        {HeaderLogo}
      </a>
    );
  }

  return <div className="flex-shrink-0 flex items-center relative">{HeaderLogo}</div>;
}
