import { Link, useMatches } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const matches = useMatches();

  // Build breadcrumb items from route matches if not provided
  const breadcrumbItems: BreadcrumbItem[] = items ?? buildBreadcrumbsFromMatches(matches);

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link to="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbItems.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1" />
          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link to={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

function buildBreadcrumbsFromMatches(matches: ReturnType<typeof useMatches>): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  for (const match of matches) {
    const context = match.context as { breadcrumb?: string } | undefined;
    const loaderData = match.loaderData as { breadcrumb?: string } | undefined;

    // Try to get breadcrumb from context or loader data
    const breadcrumb = context?.breadcrumb ?? loaderData?.breadcrumb;

    if (breadcrumb) {
      items.push({
        label: breadcrumb,
        href: match.pathname,
      });
    } else if (match.pathname !== "/" && match.pathname !== "/_app") {
      // Infer breadcrumb from pathname
      const segments = match.pathname.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1];

      if (lastSegment && !lastSegment.startsWith("_")) {
        // Convert slug to readable name
        const label = formatBreadcrumbLabel(lastSegment);

        // Avoid duplicates
        if (!items.some((item) => item.label === label)) {
          items.push({
            label,
            href: match.pathname,
          });
        }
      }
    }
  }

  return items;
}

function formatBreadcrumbLabel(slug: string): string {
  // Handle common patterns
  if (slug === "events") return "Events";
  if (slug === "fighters" || slug === "all-fighters") return "Fighters";
  if (slug === "search") return "Search";

  // Convert kebab-case to Title Case
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
