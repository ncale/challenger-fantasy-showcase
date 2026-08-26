import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/_app")({
  component: AppLayoutComponent,
});

function AppLayoutComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showSecondary />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <TanStackRouterDevtools />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
