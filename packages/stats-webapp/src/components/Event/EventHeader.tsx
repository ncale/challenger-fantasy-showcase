import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { singleEventQuery } from "@/lib/init-queries";

export function EventHeader({ eventIdOrSlug }: { eventIdOrSlug: string }) {
  const { data, isLoading, error } = useQuery(singleEventQuery(eventIdOrSlug));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !data) {
    return <div>Error loading event.</div>;
  }

  return (
    <div className="flex flex-col items-start justify-between mb-8">
      <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-2">{data.name}</h1>

      <div className="text-sm sm:text-base flex flex-col sm:flex-row items-start sm:items-center gap-0.5 sm:gap-4 text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="size-3.5 sm:size-4" />
          <span>{new Date(data.startTimeUtc).toLocaleDateString()}</span>
        </div>

        {/* {location && (
          <div className="flex items-center gap-1">
            <MapPin className="size-3.5 sm:size-4" />
            <span>{location}</span>
          </div>
        )} */}
      </div>
    </div>
  );
}
