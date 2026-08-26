import { UsernameSchema } from "@challenger-fantasy/schemas";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { MainFooter } from "~/components/main-footer";
import { userAccountQuery, userProfileQuery } from "~/lib/init-queries";
import { checkAuthStatusFn } from "~/lib/server-fns";
import { getSupabaseBrowserClient } from "~/lib/supabase-client";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location, context }) => {
    const { isAuthenticated, user, session } = await checkAuthStatusFn();

    if (!isAuthenticated) {
      throw redirect({ to: "/join" });
    }

    const supabaseBrowser = getSupabaseBrowserClient();
    await supabaseBrowser.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    const userAccount = await context.queryClient.ensureQueryData(userAccountQuery(user.id));

    // Check if user needs to complete onboarding
    const isValidUsername = UsernameSchema.safeParse(userAccount.username).success;
    if (!isValidUsername) {
      throw redirect({ to: "/join" });
    }

    // Allow pending users to access waitlist page only
    if (userAccount.status === "pending" && location.pathname !== "/waitlist") {
      throw redirect({ to: "/waitlist" });
    }

    return { user };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(userProfileQuery(context.user.id)),
  component: AppLayoutComponent,
});

function AppLayoutComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>

      <MainFooter />
    </div>
  );
}
