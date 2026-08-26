import type { UserProfile } from "@challenger-fantasy/types";
import { Link } from "@tanstack/react-router";
import { HeaderLogo } from "./header-logo";
import { UserMenu } from "./UserMenu";

export function MainHeader({ profile }: { profile: UserProfile }) {
  return (
    <header className="h-header-height header-x-padding flex justify-between items-center sticky top-0 z-10 bg-background">
      <nav className="h-full flex items-center gap-x-4 font-medium">
        <HeaderLogo />

        <Link to="/daily/home" className="">
          Daily
        </Link>
      </nav>

      <UserMenu profile={profile} />
    </header>
  );
}
