import { useMatches } from "@tanstack/react-router";
import { Breadcrumb } from "./Breadcrumb";

interface SecondaryHeaderProps {
  title?: string;
}

export const SecondaryHeader = ({ title }: SecondaryHeaderProps) => {
  const matches = useMatches();

  const items = matches
    .filter((match) => match.staticData.breadcrumb || match.staticData.getTitle)
    .map((match) => ({
      label: match.staticData?.getTitle
        ? match.staticData?.getTitle(match.loaderData)
        : (match.staticData?.breadcrumb as string),
      href: match.pathname,
    }));

  return (
    <div className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-10">
          <Breadcrumb items={items} />
          {title && (
            <h1 className="text-sm font-medium text-foreground hidden sm:block">{title}</h1>
          )}
        </div>
      </div>
    </div>
  );
};
