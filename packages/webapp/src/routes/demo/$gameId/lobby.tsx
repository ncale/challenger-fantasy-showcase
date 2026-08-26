import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDemoDraft } from "~/hooks/use-demo-draft";

export const Route = createFileRoute("/demo/$gameId/lobby")({
  component: DemoLobbyPage,
});

function DemoLobbyPage() {
  const { gameId } = Route.useParams();
  const { gameStates, leaveGame, myUserId } = useDemoDraft();
  const navigate = useNavigate();

  const draftState = gameStates[gameId];

  // Transition to draft page once the draft starts
  useEffect(() => {
    if (draftState?.status === "initializing" || draftState?.status === "in-progress") {
      navigate({ to: "/demo/$gameId/draft", params: { gameId } });
    }
  }, [draftState?.status, gameId, navigate]);

  // Still connecting — show spinner
  if (draftState === null) {
    return (
      <div className="min-h-screen bg-[var(--dui-base-300)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--dui-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not joined (e.g. direct navigation to this URL)
  if (draftState === undefined) {
    return (
      <div className="min-h-screen bg-[var(--dui-base-300)] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[var(--dui-base-content)] opacity-60">
          You haven't joined this lobby yet.
        </p>
        <Link
          to="/demo/$gameId"
          params={{ gameId }}
          className="text-sm font-semibold text-[var(--dui-primary)] hover:opacity-80 transition-opacity"
        >
          ← Go to game
        </Link>
      </div>
    );
  }

  const connectedPlayers = Array.from(draftState.users);
  const draftSize = draftState.draftConfig.draftSize;
  const waitingFor = draftSize - connectedPlayers.length;
  const progress = connectedPlayers.length / draftSize;
  const inviteUrl = `${window.location.origin}/demo/${gameId}`;

  return (
    <div className="min-h-screen bg-[var(--dui-base-300)]">
      {/* Header */}
      <div className="bg-[var(--dui-base-100)] border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-6 h-12">
          <button
            type="button"
            onClick={() => {
              leaveGame(gameId);
              navigate({ to: "/demo/$gameId", params: { gameId } });
            }}
            className="text-[var(--dui-base-content)] opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-semibold text-sm text-[var(--dui-base-content)]">Demo Lobby</h1>
          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--dui-secondary)] text-[var(--dui-secondary-content)] uppercase tracking-wide">
            Demo
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
        {/* Left: status + player list */}
        <div className="col-span-2 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--dui-base-content)]">
              {waitingFor > 0
                ? `Waiting for ${waitingFor} more player${waitingFor !== 1 ? "s" : ""}…`
                : "Lobby full — starting soon"}
            </h2>
            <p className="text-sm text-[var(--dui-base-content)] opacity-50 mt-1">
              {connectedPlayers.length} of {draftSize} players ready
            </p>
          </div>

          <div className="h-1.5 bg-[var(--dui-base-200)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--dui-primary)] rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="space-y-1.5">
            {connectedPlayers.map((player) => (
              <div
                key={player.userId}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--dui-base-100)] border border-border"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--dui-success)] flex-shrink-0" />
                <span className="text-sm font-medium text-[var(--dui-base-content)]">
                  {player.username ?? player.userId}
                </span>
                {player.userId === myUserId && (
                  <span className="ml-auto text-xs text-[var(--dui-base-content)] opacity-40">
                    you
                  </span>
                )}
              </div>
            ))}
            {Array.from({ length: waitingFor }, (_, i) => connectedPlayers.length + i + 1).map(
              (slotNum) => (
                <div
                  key={`slot-${slotNum}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--dui-base-100)] border border-dashed border-border opacity-40"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--dui-base-content)] opacity-30 flex-shrink-0" />
                  <span className="text-sm text-[var(--dui-base-content)]">Waiting…</span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Right: invite */}
        <div>
          <div className="bg-[var(--dui-base-100)] rounded-xl border border-border p-4 space-y-3 sticky top-6">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--dui-base-content)]">
              <LinkIcon size={14} />
              Invite others
            </div>
            <p className="text-xs text-[var(--dui-base-content)] opacity-50">
              Share this link so others can join the same lobby.
            </p>
            <InviteLink url={inviteUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InviteLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        className="flex-1 px-2.5 py-1.5 rounded-lg bg-[var(--dui-base-200)] text-xs text-[var(--dui-base-content)] border border-border truncate focus:outline-none"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="flex-shrink-0 p-1.5 rounded-lg bg-[var(--dui-base-200)] hover:bg-[var(--dui-base-300)] border border-border transition-colors"
        title="Copy link"
      >
        {copied ? (
          <Check size={14} className="text-[var(--dui-success)]" />
        ) : (
          <Copy size={14} className="text-[var(--dui-base-content)] opacity-60" />
        )}
      </button>
    </div>
  );
}
