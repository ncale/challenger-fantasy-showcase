import { UsernameSchema } from "@challenger-fantasy/schemas";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { HeaderLogo } from "~/components/header-logo";
import { userAccountQuery } from "~/lib/init-queries";
import { checkAuthStatusFn } from "~/lib/server-fns";
import { getSupabaseBrowserClient } from "~/lib/supabase-client";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ location, context }) => {
    const { isAuthenticated, user, session } = await checkAuthStatusFn();

    if (isAuthenticated && location.pathname !== "/logout") {
      const supabaseBrowser = getSupabaseBrowserClient();
      await supabaseBrowser.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      const userAccount = await context.queryClient.ensureQueryData(userAccountQuery(user.id));

      // User is authenticated - determine where to redirect
      const isValidUsername = UsernameSchema.safeParse(userAccount.username).success;
      if (!isValidUsername) {
        // New user without username - let them continue on join page to set username
        if (location.pathname === "/join") return;
        throw redirect({ to: "/join" });
      }

      if (userAccount.status === "pending") {
        // User has pending status - redirect to waitlist
        throw redirect({ to: "/waitlist" });
      }

      throw redirect({ to: "/daily/home" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="page-container max-w-2xl mx-auto flex flex-col gap-y-12 mt-10 mb-20 items-center">
      <HeaderLogo column />

      <Outlet />
    </div>
  );
}
