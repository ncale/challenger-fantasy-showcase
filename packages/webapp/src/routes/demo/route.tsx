import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useDemoDraft } from "~/hooks/use-demo-draft";
import { singleGameQuery } from "~/lib/init-queries";
import { DemoDraftProvider } from "~/providers/demo-draft-provider";

export const Route = createFileRoute("/demo")({
  component: DemoLayout,
});

function DemoLayout() {
  return (
    <DemoDraftProvider>
      <Outlet />
      <InProgressIndicator />
    </DemoDraftProvider>
  );
}

function InProgressIndicator() {
  const { inProgressGameIds } = useDemoDraft();
  const routerState = useRouterState();

  if (inProgressGameIds.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 items-end">
      {inProgressGameIds.map((gameId) => {
        // Don't show the chip when already on that game's draft page
        const isDraftPage = routerState.location.pathname === `/demo/${gameId}/draft`;
        if (isDraftPage) return null;
        return <ActiveDraftChip key={gameId} gameId={gameId} />;
      })}
    </div>
  );
}

function ActiveDraftChip({ gameId }: { gameId: string }) {
  const navigate = useNavigate();
  const { gameStates } = useDemoDraft();
  const { data: game } = useQuery(singleGameQuery(gameId));
  const state = gameStates[gameId];

  if (!state) return null;

  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/demo/$gameId/draft", params: { gameId } })}
      className="flex items-center gap-2.5 bg-[var(--dui-success)] text-[var(--dui-success-content)] px-3 py-2 rounded-xl shadow-lg text-sm font-semibold hover:opacity-90 transition-opacity"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--dui-success-content)] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--dui-success-content)]" />
      </span>
      {game?.name ?? "Draft in progress"}
    </button>
  );
}
