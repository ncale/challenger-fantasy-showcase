import { formatDate } from "@challenger-fantasy/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { singleEventQuery, useUpcomingEventsWithCacheSeed } from "~/lib/init-queries";

export const Route = createFileRoute("/demo/")({
  component: DemoHomePage,
});

function DemoHomePage() {
  return (
    <div className="min-h-screen bg-[var(--dui-base-300)]">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <DemoBanner />
        <Suspense fallback={<EventsSkeleton />}>
          <UpcomingEventsList />
        </Suspense>
      </div>
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="rounded-xl border border-[var(--dui-primary)] bg-[var(--dui-primary)]/10 px-4 py-3 flex items-start gap-3">
      <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--dui-primary)] text-[var(--dui-primary-content)] uppercase tracking-wide mt-0.5 flex-shrink-0">
        Demo
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--dui-base-content)]">
          Try Challenger Fantasy
        </p>
        <p className="text-xs text-[var(--dui-base-content)] opacity-60 mt-0.5">
          Pick a game below and draft with real people. No sign-in needed — it's just a preview.
        </p>
      </div>
      <Link
        to="/join"
        className="flex-shrink-0 text-xs font-semibold text-[var(--dui-primary)] hover:opacity-80 transition-opacity whitespace-nowrap"
      >
        Join waitlist →
      </Link>
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl overflow-hidden animate-pulse">
          <div className="h-14 bg-[var(--dui-base-200)]" />
          <div className="p-3 space-y-2">
            <div className="h-10 bg-[var(--dui-base-200)] rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function UpcomingEventsList() {
  const { data: upcomingEvents } = useUpcomingEventsWithCacheSeed(2);

  if (upcomingEvents.events.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--dui-base-content)] opacity-50 text-sm">
        No upcoming events to demo right now. Check back soon!
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {upcomingEvents.events.map((event) => (
        <EventSection key={event.id} eventId={event.id} />
      ))}
    </div>
  );
}

function EventSection({ eventId }: { eventId: string }) {
  const { data: event } = useSuspenseQuery(singleEventQuery(eventId));

  return (
    <div className="rounded-xl overflow-hidden bg-[var(--dui-base-100)]">
      <div className="bg-[var(--dui-base-200)] px-4 py-2.5">
        <h2 className="text-sm font-bold text-[var(--dui-base-content)] leading-tight">
          {event.name}
        </h2>
        <p className="text-xs text-[var(--dui-base-content)] opacity-60 mt-0.5">
          {formatDate(event.startTimeUtc, "game-time")}
        </p>
      </div>

      <div className="p-3 space-y-1.5">
        {event.games.length === 0 ? (
          <p className="text-xs text-[var(--dui-base-content)] opacity-50 py-2">
            No games available yet
          </p>
        ) : (
          event.games.map((game) => (
            <Link
              key={game.id}
              to="/demo/$gameId"
              params={{ gameId: game.id }}
              className="flex items-center justify-between bg-[var(--dui-base-100)] border border-border hover:bg-[var(--dui-base-200)] transition-colors rounded-lg px-3 py-2.5 group"
            >
              <span className="text-sm font-medium text-[var(--dui-base-content)]">
                {game.name}
              </span>
              <ChevronRight
                size={14}
                className="text-[var(--dui-base-content)] opacity-40 group-hover:opacity-70 transition-opacity"
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
