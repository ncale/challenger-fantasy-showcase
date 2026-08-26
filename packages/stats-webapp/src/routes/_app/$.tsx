import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, Search } from "lucide-react";
import { buttonVariants } from "@/components/Buttons/Button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/$")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-9xl font-bold text-foreground select-none">404</h1>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted,
            or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>

          <Link to="/search" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            <Search className="w-5 h-5 mr-2" />
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
