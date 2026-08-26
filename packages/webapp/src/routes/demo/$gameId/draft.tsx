import { useCountdown } from "@challenger-fantasy/api-queries";
import { getWeightCodeFromKey } from "@challenger-fantasy/core";
import type { Drafter, DraftState } from "@challenger-fantasy/schemas";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useDemoDraft } from "~/hooks/use-demo-draft";
import {
  singleFighterSimpleQuery,
  singleGameQuery,
  useEventCardWithCacheSeed,
} from "~/lib/init-queries";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/demo/$gameId/draft")({
  component: DemoDraftPage,
});

function DemoDraftPage() {
  const { gameId } = Route.useParams();
  const { gameStates } = useDemoDraft();
  const navigate = useNavigate();

  const draftState = gameStates[gameId];

  // Not connected — send back to game detail
  useEffect(() => {
    if (draftState === undefined) {
      navigate({ to: "/demo/$gameId", params: { gameId }, replace: true });
    }
  }, [draftState, gameId, navigate]);

  if (!draftState) return null;

  return (
    <div className="h-screen bg-[var(--dui-base-300)] flex flex-col overflow-hidden">
      <DemoDraftHeader />
      <DemoDraftClock gameId={gameId} draftState={draftState} />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <DemoPickTable draftState={draftState} />
        </div>
        <div className="w-72 flex-shrink-0 border-l border-border overflow-y-auto bg-[var(--dui-base-200)]">
          <DemoFighterSelector gameId={gameId} draftState={draftState} />
        </div>
      </div>

      {draftState.status === "completed" && (
        <DemoCompletedOverlay gameId={gameId} draftState={draftState} />
      )}
    </div>
  );
}

function DemoDraftHeader() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 px-4 h-12 bg-[var(--dui-base-100)] border-b border-border flex-shrink-0">
      <button
        type="button"
        onClick={() => navigate({ to: "/demo" })}
        className="text-[var(--dui-base-content)] opacity-60 hover:opacity-100 transition-opacity text-sm"
      >
        ✕
      </button>
      <h1 className="font-semibold text-sm text-[var(--dui-base-content)]">Live Draft</h1>
      <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--dui-secondary)] text-[var(--dui-secondary-content)] uppercase tracking-wide">
        Demo
      </span>
    </div>
  );
}

function DemoDraftClock({
  gameId: _gameId,
  draftState,
}: {
  gameId: string;
  draftState: DraftState;
}) {
  const currentPickerName =
    draftState.status === "in-progress"
      ? (Array.from(draftState.users).find((u) => u.userId === draftState.currentPickerId)
          ?.username ?? "…")
      : undefined;

  const nextPickAt =
    draftState.nextPickAt ??
    new Date(Date.now() + (draftState.draftConfig.pickClockSeconds ?? 20) * 1000);
  const [secondsRemaining] = useCountdown(nextPickAt, true);

  const max = draftState.draftConfig.pickClockSeconds;
  const progress = Math.max(0, secondsRemaining / max);

  if (draftState.status === "in-progress") {
    return (
      <div className="px-4 py-2 flex items-center gap-4 bg-[var(--dui-base-100)] border-b border-border flex-shrink-0">
        <span className="text-sm font-medium text-[var(--dui-base-content)] opacity-70">
          {currentPickerName}'s turn
        </span>
        <div className="flex-1 h-1.5 bg-[var(--dui-base-200)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--dui-success)] rounded-full transition-all duration-1000"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-[var(--dui-success)] tabular-nums">
          {secondsRemaining}s
        </span>
      </div>
    );
  }

  if (draftState.status === "initializing") {
    return (
      <div className="px-4 py-2 flex items-center gap-2 bg-[var(--dui-base-100)] border-b border-border flex-shrink-0">
        <div className="w-3 h-3 border-2 border-[var(--dui-success)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[var(--dui-base-content)] opacity-60">Starting draft…</span>
      </div>
    );
  }

  return null;
}

const CELL_WIDTH = 150;
const ROW_HEIGHT = 52;
const FIRST_COL_WIDTH = 80;
const HEADER_HEIGHT = 44;

function DemoPickTable({ draftState }: { draftState: DraftState }) {
  const drafters = Array.from(draftState.users.values());
  const rounds = Array.from({ length: draftState.draftConfig.numRounds });

  return (
    <div className="p-4 inline-block min-w-full">
      <div className="flex">
        <div style={{ width: FIRST_COL_WIDTH, height: HEADER_HEIGHT }} />
        {drafters.map((drafter) => {
          const isCurrentPicker =
            draftState.status === "in-progress" && draftState.currentPickerId === drafter.userId;
          return (
            <DemoPickTableHeaderCell
              key={drafter.userId}
              username={drafter.username ?? drafter.userId}
              isCurrentPicker={isCurrentPicker}
            />
          );
        })}
      </div>

      <div className="flex flex-col gap-1">
        {rounds.map((_, rowIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: position-based key
          <div key={`row-${rowIndex}`} className="flex gap-1">
            <div
              style={{ width: FIRST_COL_WIDTH, height: ROW_HEIGHT }}
              className="flex items-center"
            >
              <span className="text-xs font-semibold text-[var(--dui-base-content)] opacity-50">
                Round {rowIndex + 1}
              </span>
            </div>
            {drafters.map((drafter, colIndex) => (
              <DemoPickTableCell
                // biome-ignore lint/suspicious/noArrayIndexKey: position-based key
                key={`cell-${rowIndex}-${colIndex}`}
                drafter={drafter}
                rowIndex={rowIndex}
                isCurrentPickCell={
                  draftState.status === "in-progress" &&
                  draftState.currentPickerId === drafter.userId &&
                  draftState.currentRound === rowIndex + 1
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoPickTableHeaderCell({
  username,
  isCurrentPicker,
}: {
  username: string;
  isCurrentPicker: boolean;
}) {
  return (
    <div
      style={{ minWidth: CELL_WIDTH, height: HEADER_HEIGHT }}
      className="flex items-center gap-2 px-3"
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
          isCurrentPicker
            ? "bg-[var(--dui-success)] text-[var(--dui-success-content)]"
            : "bg-[var(--dui-primary)] text-[var(--dui-primary-content)]",
        )}
      >
        {username[0]?.toUpperCase() ?? "?"}
      </div>
      <span className="font-semibold text-sm text-[var(--dui-base-content)] truncate">
        {username}
      </span>
    </div>
  );
}

function DemoPickTableCell({
  drafter,
  rowIndex,
  isCurrentPickCell,
}: {
  drafter: Drafter;
  rowIndex: number;
  isCurrentPickCell: boolean;
}) {
  const fighterId = drafter.picks[rowIndex]?.fighterId;
  const { data: fighter } = useQuery(singleFighterSimpleQuery(fighterId));

  return (
    <div
      style={{ minWidth: CELL_WIDTH, height: ROW_HEIGHT }}
      className={cn(
        "flex items-center px-3 rounded-lg border text-sm",
        isCurrentPickCell
          ? "border-[var(--dui-success)] border-2 bg-[var(--dui-base-100)]"
          : "border-border bg-[var(--dui-base-100)]",
      )}
    >
      {fighterId ? (
        <span className="text-[var(--dui-base-content)] truncate">{fighter?.name ?? "…"}</span>
      ) : (
        <span className="text-[var(--dui-base-content)] opacity-30">—</span>
      )}
    </div>
  );
}

function DemoFighterSelector({ gameId, draftState }: { gameId: string; draftState: DraftState }) {
  const { pickFighter, myUserId } = useDemoDraft();
  const { data: game } = useSuspenseQuery(singleGameQuery(gameId));
  const { data: cardData } = useEventCardWithCacheSeed(game.eventId);

  const fighterEventMap = new Map(cardData?.fighterEventInfo.map((f) => [f.fighterId, f]) ?? []);

  const drafters = Array.from(draftState.users.values());
  const pickedIds = new Set(drafters.flatMap((d) => d.picks.map((p) => p.fighterId)));
  const availableFighters = cardData?.fighters.filter((f) => !pickedIds.has(f.id)) ?? [];

  const isMyTurn = draftState.status === "in-progress" && draftState.currentPickerId === myUserId;

  return (
    <div>
      <div className="px-3 py-2 sticky top-0 bg-[var(--dui-base-200)] border-b border-border z-10">
        <span className="text-xs font-semibold text-[var(--dui-base-content)] opacity-60 uppercase tracking-wide">
          Available ({availableFighters.length})
        </span>
      </div>
      <div>
        {availableFighters.map((fighter) => {
          const info = fighterEventMap.get(fighter.id);
          const weightCode = info ? getWeightCodeFromKey(info.fightWeightKey) : "";
          const opponentText = info ? `vs. ${info.opponent.name} · ${weightCode}` : "";

          return (
            <div
              key={fighter.id}
              className="flex items-center px-3 py-2.5 border-b border-border/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--dui-base-content)] truncate">
                  {fighter.name}
                </p>
                {opponentText && (
                  <p className="text-xs text-[var(--dui-base-content)] opacity-50 mt-0.5 truncate">
                    {opponentText}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => pickFighter(gameId, fighter.id)}
                disabled={!isMyTurn}
                className={cn(
                  "ml-2 flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-base font-bold transition-opacity",
                  isMyTurn
                    ? "bg-[var(--dui-success)] text-[var(--dui-success-content)] hover:opacity-90"
                    : "bg-[var(--dui-base-content)] opacity-20 text-[var(--dui-base-100)] cursor-not-allowed",
                )}
              >
                +
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DemoCompletedOverlay({ gameId, draftState }: { gameId: string; draftState: DraftState }) {
  const drafters = Array.from(draftState.users.values());

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-[var(--dui-base-100)] rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="text-center space-y-1">
          <div className="text-3xl">🏆</div>
          <h2 className="text-xl font-bold text-[var(--dui-base-content)]">Draft complete!</h2>
          <p className="text-sm text-[var(--dui-base-content)] opacity-60">
            That's how Challenger Fantasy works. Sign up to track scores live and compete on the
            leaderboard.
          </p>
        </div>

        <div className="rounded-xl bg-[var(--dui-base-200)] p-3 space-y-3">
          {drafters.map((drafter) => (
            <div key={drafter.userId} className="space-y-1">
              <p className="text-xs font-bold text-[var(--dui-base-content)] opacity-50 uppercase tracking-wide">
                {drafter.username ?? drafter.userId}
              </p>
              <div className="flex flex-wrap gap-1">
                {drafter.picks.map((pick) => (
                  <DraftedFighterChip key={pick.fighterId} fighterId={pick.fighterId} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link
            to="/join"
            className="flex-1 py-2.5 rounded-xl bg-[var(--dui-primary)] text-[var(--dui-primary-content)] font-semibold text-sm text-center hover:opacity-90 transition-opacity"
          >
            Join the waitlist
          </Link>
          <Link
            to="/demo/$gameId"
            params={{ gameId }}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm text-center text-[var(--dui-base-content)] opacity-60 hover:opacity-80 transition-opacity"
          >
            Try another game
          </Link>
        </div>
      </div>
    </div>
  );
}

function DraftedFighterChip({ fighterId }: { fighterId: string }) {
  const { data: fighter } = useQuery(singleFighterSimpleQuery(fighterId));
  return (
    <span className="text-xs bg-[var(--dui-base-300)] text-[var(--dui-base-content)] px-2 py-0.5 rounded-full">
      {fighter?.name ?? "…"}
    </span>
  );
}
