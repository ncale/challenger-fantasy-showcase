import { createFileRoute } from "@tanstack/react-router";
import { EventFightsList } from "@/components/Event/EventFightsList";
import { EventHeader } from "@/components/Event/EventHeader";

export const Route = createFileRoute("/_app/events/$eventIdOrSlug/")({
  component: EventPage,
});

function EventPage() {
  const { eventIdOrSlug } = Route.useParams();

  return (
    <div className="page-container">
      <EventHeader eventIdOrSlug={eventIdOrSlug} />

      <EventFightsList eventIdOrSlug={eventIdOrSlug} />
    </div>
  );
}
