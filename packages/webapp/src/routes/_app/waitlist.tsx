import { createFileRoute } from "@tanstack/react-router";
import { HeaderLogo } from "~/components/header-logo";
import { WaitlistCard } from "~/components/waitlist/waitlist-card";
import { WaitlistFooter } from "~/components/waitlist/waitlist-footer";
import { userAccountQuery } from "~/lib/init-queries";

export const Route = createFileRoute("/_app/waitlist")({
  loader: ({ context }) => context.queryClient.ensureQueryData(userAccountQuery(context.user.id)),
  component: WaitlistPage,
});

function WaitlistPage() {
  const userAccount = Route.useLoaderData();

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="page-container max-w-xl mx-auto flex flex-col gap-y-8 py-10 px-4">
      <div className="text-center">
        <HeaderLogo column />
      </div>

      <div className="space-y-6">
        {userAccount.username && userAccount.referral_code && (
          <WaitlistCard
            username={userAccount.username}
            position={userAccount.effective_waitlist_position ?? userAccount.user_number ?? 1}
            referralBonus={userAccount.referral_bonus ?? 0}
            referralCode={userAccount.referral_code}
            baseUrl={baseUrl}
          />
        )}

        <WaitlistFooter />
      </div>
    </div>
  );
}
