import { displayDaysUntilEvent, formatDate, isNullish } from "@challenger-fantasy/core";
import { eventTabsSearchSchema } from "@challenger-fantasy/schemas";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Calendar, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/LoadingUI/Skeleton";
import { Pill } from "@/components/Pill/Pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import { eventsQuery } from "@/lib/init-queries";

export const Route = createFileRoute("/_app/events/")({
  component: EventsPage,
  validateSearch: eventTabsSearchSchema,
});

// TODO: figure out a better system for sharing these types
interface EventListItem {
  id: string;
  name: string;
  slug: string;
  startTimeUtc: string;
  status: string;
}

function EventItem({ event }: { event: EventListItem }) {
  const daysUntilEvent = displayDaysUntilEvent(event.startTimeUtc);

  return (
    <Link to="/events/$eventIdOrSlug" params={{ eventIdOrSlug: event.slug }}>
      <div className="p-4 bg-card hover:bg-accent transition-colors duration-200 group cursor-pointer">
        <h3 className="font-bold text-base text-foreground leading-tight mb-2 group-hover:text-accent-foreground transition-colors">
          {event.name}
        </h3>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 h-6">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="font-medium">{formatDate(event.startTimeUtc, "only-date")}</span>
              {event.status === "scheduled" && daysUntilEvent && (
                <Pill color="blue" variant="regular">
                  {daysUntilEvent}
                </Pill>
              )}
            </div>
          </div>

          <ChevronRight className="size-5 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
        </div>
      </div>
    </Link>
  );
}

function EventsSectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background rounded-lg border border-border divide-y divide-border overflow-hidden">
      {children}
    </div>
  );
}

function EventsSection({
  isLoading,
  error,
  events,
  skeletonCount = 3,
}: {
  isLoading: boolean;
  error: unknown;
  events: EventListItem[] | undefined;
  skeletonCount?: number;
}) {
  if (isLoading) {
    return (
      <EventsSectionWrapper>
        {[...Array(skeletonCount)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <skeleton rows do not have content>
          <div key={`event-skeleton-${i}`} className="h-21 p-4">
            <Skeleton className={`h-5 w-3/4 mb-2`} />
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="size-4" />
            </div>
          </div>
        ))}
      </EventsSectionWrapper>
    );
  }

  if (error) {
    return (
      <EventsSectionWrapper>
        <div className="flex justify-center items-center h-full">
          <div className="bg-error/50 text-error-foreground rounded-md flex flex-col items-center justify-center px-4 py-2 my-12 gap-y-2">
            <div className="flex items-center justify-center gap-x-2">
              <Calendar className="size-4" />
              <h3 className="text-sm font-medium">Error Loading Events</h3>
            </div>
            <p className="text-xs">
              {error instanceof Error ? error.message : "An error occurred while loading events"}
            </p>
          </div>
        </div>
      </EventsSectionWrapper>
    );
  }

  if (isNullish(events) || events.length === 0) {
    return (
      <EventsSectionWrapper>
        <div className="text-center py-12">
          <h3 className="font-semibold text-muted-foreground">No events found</h3>
        </div>
      </EventsSectionWrapper>
    );
  }

  return (
    <EventsSectionWrapper>
      {events.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </EventsSectionWrapper>
  );
}

function UpcomingEventsSection({ eventsCount = 5 }: { eventsCount?: number }) {
  const { data, isLoading, error } = useQuery(eventsQuery({ status: "upcoming", pageSize: 5 }));

  return (
    <EventsSection
      isLoading={isLoading}
      error={error}
      events={data?.events}
      skeletonCount={eventsCount}
    />
  );
}

function PastEventsSection({ eventsCount = 5 }: { eventsCount?: number }) {
  const { data, isLoading, error } = useQuery(eventsQuery({ status: "past", pageSize: 5 }));

  return (
    <EventsSection
      isLoading={isLoading}
      error={error}
      events={data?.events}
      skeletonCount={eventsCount}
    />
  );
}

function EventsPage() {
  const search = useSearch({ from: "/_app/events/" });

  const activeTab = search.tab || "upcoming";

  const setActiveTab = (newTab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newTab);
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div className="page-container">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-16">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <UpcomingEventsSection />
        </TabsContent>

        <TabsContent value="past">
          <PastEventsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
