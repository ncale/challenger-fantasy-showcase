import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "~/lib/utils";
import { buttonVariants } from "./ui/button";

const tabs = [
  { name: "Home", to: "/daily/home" },
  { name: "Active", to: "/daily/active" },
  { name: "Results", to: "/daily/results" },
];

export function DailyHeader() {
  const { location } = useRouterState();

  return (
    <nav className="bg-base-100 header-x-padding h-full flex items-center gap-x-4 py-2 font-medium sticky top-header-height z-10">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              buttonVariants({
                variant: isActive ? "outline" : "ghost",
                size: "sm",
              }),
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
