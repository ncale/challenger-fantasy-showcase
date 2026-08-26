import {
  formatDate,
  getWeightCodeFromKey,
  SCORING_PROFILES,
  unCamelize,
} from "@challenger-fantasy/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, Swords, Trophy, Users } from "lucide-react";
import { Suspense, useState } from "react";
import { useDemoDraft } from "~/hooks/use-demo-draft";
import { singleEventQuery, singleGameQuery, useEventCardWithCacheSeed } from "~/lib/init-queries";

export const Route = createFileRoute("/demo/$gameId/")({
  component: DemoGameDetailPage,
});

function DemoGameDetailPage() {
  const { gameId } = Route.useParams();
  return (
    <Suspense fallback={<GameDetailSkeleton />}>
      <DemoGameDetailContent gameId={gameId} />
    </Suspense>
  );
}

function GameDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--dui-base-300)] flex items-center justify-center">
      <div className="text-[var(--dui-base-content)] opacity-60 text-sm">Loading game…</div>
    </div>
  );
}

function DemoGameDetailContent({ gameId }: { gameId: string }) {
  const navigate = useNavigate();
  const { joinGame, username, setUsername } = useDemoDraft();
  const [localUsername, setLocalUsername] = useState(username);

  const { data: game } = useSuspenseQuery(singleGameQuery(gameId));

  const handleStartDemo = () => {
    const trimmed = localUsername.trim();
    if (!trimmed) return;
    setUsername(trimmed); // persist to sessionStorage
    joinGame(gameId, trimmed); // pass directly — don't rely on state update timing
    navigate({ to: "/demo/$gameId/lobby", params: { gameId } });
  };

  return (
    <div className="min-h-screen bg-[var(--dui-base-300)]">
      {/* Header */}
      <div className="bg-[var(--dui-base-100)] border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-6 h-12">
          <button
            type="button"
            onClick={() => navigate({ to: "/demo" })}
            className="text-[var(--dui-base-content)] opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-semibold text-sm text-[var(--dui-base-content)] flex-1 truncate">
            {game.name}
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--dui-secondary)] text-[var(--dui-secondary-content)] uppercase tracking-wide">
            Demo
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-3 gap-6">
        {/* Left: game details */}
        <div className="col-span-2 space-y-5">
          <InfoSection gameId={gameId} />
          <FightersSection gameId={gameId} />
        </div>

        {/* Right: join panel */}
        <div>
          <div className="bg-[var(--dui-base-100)] rounded-xl border border-border p-4 space-y-4 sticky top-16">
            <div>
              <p className="text-sm font-bold text-[var(--dui-base-content)]">Join this draft</p>
              <p className="text-xs text-[var(--dui-base-content)] opacity-50 mt-0.5">
                Share the link with friends to fill the lobby.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="demo-username"
                className="text-xs font-semibold text-[var(--dui-base-content)] opacity-60 uppercase tracking-wide"
              >
                Your display name
              </label>
              <input
                id="demo-username"
                type="text"
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartDemo()}
                placeholder="Enter a name…"
                maxLength={30}
                className="w-full px-3 py-2 rounded-lg bg-[var(--dui-base-200)] text-sm text-[var(--dui-base-content)] border border-border focus:outline-none focus:ring-2 focus:ring-[var(--dui-primary)] placeholder:opacity-40"
              />
            </div>

            <button
              type="button"
              onClick={handleStartDemo}
              disabled={!localUsername.trim()}
              className="w-full py-2.5 rounded-xl bg-[var(--dui-primary)] text-[var(--dui-primary-content)] font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              Try the demo
            </button>

            <p className="text-xs text-center text-[var(--dui-base-content)] opacity-40">
              No account needed — this is a preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoSection({ gameId }: { gameId: string }) {
  const { data: game } = useSuspenseQuery(singleGameQuery(gameId));
  const { data: event } = useSuspenseQuery(singleEventQuery(game.eventId));
  const { config } = game;

  const gridItems = [
    ...(config.mode.kind === "draft"
      ? [
          {
            label: "Draft size",
            value: `${config.mode.numPeople} players`,
            icon: <Users size={13} />,
          },
          {
            label: "Pick clock",
            value: `${config.mode.pickClockSeconds}s`,
            icon: <Clock size={13} />,
          },
        ]
      : []),
    { label: "Pick slots", value: `${config.numPickSlots}`, icon: <Trophy size={13} /> },
    { label: "Start time", value: formatDate(event.eventDate, "game-time"), icon: null },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-[var(--dui-base-content)] opacity-70 uppercase tracking-wide">
        Game Info
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {gridItems.map((item) => (
          <div
            key={item.label}
            className="bg-[var(--dui-base-100)] rounded-lg px-3 py-2.5 flex flex-col gap-0.5"
          >
            <span className="text-xs text-[var(--dui-base-content)] opacity-50">{item.label}</span>
            <span className="text-sm font-semibold text-[var(--dui-base-content)]">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {config.scoringProfile === "balanced" && (
        <>
          <h2 className="text-sm font-bold text-[var(--dui-base-content)] opacity-70 uppercase tracking-wide pt-1">
            Scoring
          </h2>
          <div className="bg-[var(--dui-base-100)] rounded-lg divide-y divide-border">
            {Object.entries(SCORING_PROFILES[config.scoringProfile]).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center px-3 py-2">
                <span className="text-sm text-[var(--dui-base-content)] opacity-70">
                  {unCamelize(key)}
                </span>
                <span className="text-sm font-semibold text-[var(--dui-base-content)]">
                  +{value} pts
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function FightersSection({ gameId }: { gameId: string }) {
  const { data: game } = useSuspenseQuery(singleGameQuery(gameId));
  const { data: cardData } = useEventCardWithCacheSeed(game.eventId);
  const { data: event } = useSuspenseQuery(singleEventQuery(game.eventId));

  const fighterEventMap = new Map(cardData?.fighterEventInfo.map((f) => [f.fighterId, f]) ?? []);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-[var(--dui-base-content)] opacity-70 uppercase tracking-wide">
        Fighters on the card
      </h2>
      {cardData ? (
        <div className="bg-[var(--dui-base-100)] rounded-lg overflow-hidden divide-y divide-border">
          {cardData.fights.map((fight) => (
            <div key={fight.id} className="divide-y divide-border">
              <FighterRow
                name={fight.fighter1.name}
                fighterId={fight.fighter1.id}
                fighterEventMap={fighterEventMap}
              />
              <FighterRow
                name={fight.fighter2.name}
                fighterId={fight.fighter2.id}
                fighterEventMap={fighterEventMap}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-[var(--dui-base-content)] opacity-50 py-4 text-center">
          Loading fighters…
        </div>
      )}
      {event && (
        <p className="text-xs text-[var(--dui-base-content)] opacity-40 text-center">
          Starts {formatDate(event.eventDate, "only-time")}
        </p>
      )}
    </section>
  );
}

function FighterRow({
  name,
  fighterId,
  fighterEventMap,
}: {
  name: string;
  fighterId: string;
  fighterEventMap: Map<string, { opponent: { name: string }; fightWeightKey: string }>;
}) {
  const info = fighterEventMap.get(fighterId);
  const weightCode = info ? getWeightCodeFromKey(info.fightWeightKey) : "";
  const opponentText = info ? `vs. ${info.opponent.name} · ${weightCode}` : "";

  return (
    <div className="flex items-center px-3 py-2.5 gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--dui-base-content)]">{name}</p>
        {opponentText && (
          <p className="text-xs text-[var(--dui-base-content)] opacity-50 mt-0.5">{opponentText}</p>
        )}
      </div>
      <Swords size={13} className="text-[var(--dui-base-content)] opacity-20 flex-shrink-0" />
    </div>
  );
}
