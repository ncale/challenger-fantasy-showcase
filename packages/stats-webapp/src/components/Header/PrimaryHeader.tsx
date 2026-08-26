import { Link } from "@tanstack/react-router";
import { Calendar, Menu, Search, Users, X } from "lucide-react";
import { useState } from "react";
import { HeaderLogo } from "../Branding/HeaderLogo";
import { HeaderSearch } from "./HeaderSearch";

export const PrimaryHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-sidebar border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-header-height">
          <div className="flex items-center">
            <HeaderLogo />

            <div className="hidden lg:ml-8 lg:flex lg:space-x-4">
              <Link
                to="/events"
                className="flex items-center px-3 py-2 text-sm font-medium text-sidebar-foreground hover:text-accent-foreground hover:bg-accent rounded-md transition-colors"
                activeProps={{ className: "text-accent-foreground bg-accent" }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </Link>

              <Link
                to="/fighters"
                className="flex items-center px-3 py-2 text-sm font-medium text-sidebar-foreground hover:text-accent-foreground hover:bg-accent rounded-md transition-colors"
                activeProps={{ className: "text-accent-foreground bg-accent" }}
              >
                <Users className="w-4 h-4 mr-2" />
                Fighters
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            <HeaderSearch className="w-80" />
          </div>

          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={toggleMobileMenu}
              className="text-muted-foreground focus:text-accent-foreground transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              type="button"
            >
              {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border bg-card">
              <Link
                to="/search"
                className="flex items-center px-3 py-2 text-base font-medium text-sidebar-foreground focus:text-accent-foreground focus:bg-accent rounded-md transition-colors"
                activeProps={{ className: "text-accent-foreground bg-accent" }}
                onClick={closeMobileMenu}
              >
                <Search className="w-5 h-5 mr-3" />
                Search
              </Link>

              <Link
                to="/events"
                className="flex items-center px-3 py-2 text-base font-medium text-sidebar-foreground focus:text-accent-foreground focus:bg-accent rounded-md transition-colors"
                activeProps={{ className: "text-accent-foreground bg-accent" }}
                onClick={closeMobileMenu}
              >
                <Calendar className="w-5 h-5 mr-3" />
                Events
              </Link>

              <Link
                to="/fighters"
                className="flex items-center px-3 py-2 text-base font-medium text-sidebar-foreground focus:text-accent-foreground focus:bg-accent rounded-md transition-colors"
                activeProps={{ className: "text-accent-foreground bg-accent" }}
                onClick={closeMobileMenu}
              >
                <Users className="w-5 h-5 mr-3" />
                Fighters
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
